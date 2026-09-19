# Chatbot Enhancement Plan — OpsNinja

The current orchestrator creates a brand-new agent per message with no conversation history and a system prompt that only knows about the vault. This plan upgrades the chatbot across four dimensions: **context** (conversation memory + project graph), **action capability** (full Jira/Slack mutations with human-in-the-loop), **output format** (structured, frontend-renderable responses), and **efficiency** (token limits, caching, tool discipline).

---

## Current State

```
POST /api/v1/projects/:projectId/chats/:chatId/messages
  body: { message, jira_credentials?, slack_credentials? }

MessageController.sendMessage(chatId, text, jiraCredentials, slackCredentials)
  → chat exists check
  → save USER message to DynamoDB
  → OrchestratorAgent.respond(text, { jira?, slack? })      ← stateless, no history
      → createOrchestratorAgent()                           ← fresh agent every call
          tools: vault.createTools()                        ← read-only vault only
               + jiraAgent.createTools(creds)               ← read-only jira
               + slackAgent.createTools(creds)              ← read-only slack
      → agent.invoke(text, { limits: { turns: 8, tokens: 16_000 } })
  → save SYSTEM reply to DynamoDB
  → return { user_message, agent_reply }
```

**Problems:**
1. Agent has no conversation history — each message is answered in isolation
2. Agent has no project context — doesn't know which project it's serving
3. Agent has no meeting context — vault search is the only bridge to prior meetings
4. Mutations (Jira create, Slack send) require a separate `executeAction` roundtrip; the agent can't propose them inline in chat
5. Responses are raw strings — frontend has to parse them for structured display
6. 16,000-token global limit is a blunt instrument — no per-tool budgeting
7. No intent classification — every message hits the full agent even for trivial lookups

---

## Enhancement Plan

### 1 — Conversation History (Priority: Critical)

**Problem:** The agent never sees prior messages. A user asking "What did we decide about the deadline?" after already asking about scope gets a generic answer.

**Solution:** Load the last N messages from DynamoDB before invoking the agent and prepend them as a conversation history array. The Strands Agents SDK accepts a `history` option or a message array on `agent.invoke`.

#### Implementation in `MessageController.sendMessage`

```typescript
// Load last 10 messages for context (adjust N based on token budget)
const HISTORY_WINDOW = 10;

const recentMessages = await messageRepository.findMessagesByChatId(chatId);
const historyWindow = recentMessages.slice(-HISTORY_WINDOW);

// Format as alternating user/assistant pairs for the SDK
const conversationHistory = historyWindow.map((m) => ({
  role: m.message_type === "USER" ? "user" : "assistant",
  content: m.message,
}));

const { answer, proposedActions } = await orchestratorAgent.respond(text.trim(), {
  jira: jiraCredentials,
  slack: slackCredentials,
  history: conversationHistory,   // NEW
  projectId,                       // NEW
});
```

#### Implementation in `OrchestratorAgent.respond`

```typescript
export class OrchestratorAgent {
  async respond(message: string, context: OrchestratorContext & {
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    projectId?: string;
  } = {}) {
    const agent = createOrchestratorAgent(context);

    // Prepend history as prior conversation turns to agent.invoke
    const result = await agent.invoke(message.trim(), {
      history: context.history ?? [],
      limits: { turns: 12, totalTokens: 32_000 },
    });

    return {
      answer: getResponseText(agent),
      stopReason: result.stopReason,
    };
  }
}
```

**Token cost of history window:** 10 messages × ~150 tokens average ≈ 1,500 tokens — well within the 32k budget. Trim to 5 messages if the transcript ingestion path is active.

---

### 2 — Project Context Injection (Priority: Critical)

**Problem:** The agent doesn't know which project it's answering about. Two users in different project chats get identically generic answers from the vault.

**Solution:** Inject a dynamic system prefix at call time that tells the agent its operating context. This keeps the base system prompt clean while providing project-scoped grounding.

#### System prefix injected into `createOrchestratorAgent`

```typescript
const buildSystemPrefix = (projectId: string, projectName: string, meetingSummaries: string[]) => `
## Active Context
- **Project:** ${projectName} (ID: ${projectId})
- **You are answering on behalf of this project.** Only reference meetings, decisions, and actions that belong to it.
- **Recent meeting summaries for context:**
${meetingSummaries.length > 0
  ? meetingSummaries.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
  : "  (No meetings yet — use vault search if the user references a meeting)"}

## Your Capabilities in This Chat
- You CAN query the vault for meeting notes, decisions, action items, Jira links, and Slack messages.
- You CAN read Jira issues and Slack channels (if credentials provided).
- You CAN propose external actions (Jira ticket creation, Slack messages) — format them as structured proposals using the schema below.
- You CANNOT execute external mutations directly. When a user says "create a Jira ticket" or "send a Slack message", you MUST return a structured proposal instead.
`;
```

#### Where to load project context

In `MessageController`, before calling the agent:

```typescript
import projectRepository from "../repository/project.repository";
import meetingRepository from "../repository/meeting.repository";
import meetingRecordRepository from "../repository/meetingRecord.repository";

// Load project name
const project = await projectRepository.findProjectById(projectId);
if (!project) throw new Error("project not found");

// Load last 3 meeting summaries (titles + one-line summary only, not full MOM)
const meetings = await meetingRepository.findMeetingsByProjectId(projectId);
const recentMeetings = meetings.slice(-3);
const summaries = await Promise.all(
  recentMeetings.map(async (m) => {
    const record = await meetingRecordRepository.findRecordByMeetingId(m.meeting_id);
    return record ? `${record.summary.substring(0, 120)}…` : m.meeting_id;
  })
);
```

---

### 3 — Intent Classification (Priority: High)

**Problem:** Every message hits the full 8-turn agentic loop even for "What's the project status?" — wasting tokens and adding latency.

**Solution:** Add a lightweight intent classifier that runs before the main agent. It categorizes the message into one of four intents and routes accordingly.

#### Intent types

| Intent | Description | Handler |
|---|---|---|
| `LOOKUP` | Factual question answerable from vault/history | Full agent with vault tools |
| `ACTION_REQUEST` | User wants to create Jira ticket, send Slack message | Full agent + proposal schema |
| `CONVERSATION` | Greeting, clarification, follow-up on prior answer | Lightweight model, no tools |
| `AMBIGUOUS` | Falls through to full agent |

#### Classifier implementation

```typescript
// utils/intent.classifier.ts

import { createMeetingModel } from "./model";
import { Agent } from "@strands-agents/sdk";

export type Intent = "LOOKUP" | "ACTION_REQUEST" | "CONVERSATION" | "AMBIGUOUS";

const CLASSIFIER_PROMPT = `Classify the user message into exactly one of:
LOOKUP — asking about past meetings, decisions, action items, or project info
ACTION_REQUEST — asking to create a Jira ticket, send Slack message, or similar external action
CONVERSATION — greetings, thanks, follow-ups that don't need data retrieval
AMBIGUOUS — unclear
Reply with only the label. No explanation.`;

export async function classifyIntent(message: string): Promise<Intent> {
  const model = createMeetingModel();
  // Use model directly for a cheap one-turn completion
  const result = await model.converse([
    { role: "user", content: message },
  ], { systemPrompt: CLASSIFIER_PROMPT, maxTokens: 10 });

  const label = result.trim().toUpperCase();
  if (["LOOKUP", "ACTION_REQUEST", "CONVERSATION", "AMBIGUOUS"].includes(label)) {
    return label as Intent;
  }
  return "AMBIGUOUS";
}
```

#### Routing in `MessageController`

```typescript
import { classifyIntent } from "../utils/intent.classifier";

const intent = await classifyIntent(text.trim());

let answer: string;
let proposedActions: ActionProposal[] = [];

if (intent === "CONVERSATION") {
  // Short-circuit: respond with a lightweight prompt, no tool calls
  answer = await quickReply(text, conversationHistory);
} else {
  const result = await orchestratorAgent.respond(text.trim(), {
    jira: jiraCredentials,
    slack: slackCredentials,
    history: conversationHistory,
    projectId,
    projectName: project.name,
    meetingSummaries: summaries,
    allowActionProposals: intent === "ACTION_REQUEST",
  });
  answer = result.answer;
  proposedActions = result.proposedActions ?? [];
}
```

---

### 4 — Action Proposals in Chat (Priority: High)

**Problem:** The only way to create a Jira ticket from chat is via the separate `executeAction` endpoint after transcript processing. A user saying "create a Jira ticket for the deadline risk" in chat has no path to doing that.

**Solution:** When the agent detects an `ACTION_REQUEST` intent, it returns a **structured proposal object** alongside its text answer. The frontend renders this as an approval card; the user clicks approve, which calls the existing `POST /:actionId/execute` endpoint.

#### Structured proposal schema

The agent is instructed (via system prompt) to emit a JSON block inside its answer when it wants to propose an action:

```
<<ACTION_PROPOSAL>>
{
  "type": "jira" | "slack",
  "title": "string — max 80 chars",
  "description": "string — full context for the action",
  "target": "string — Jira project key or Slack channel",
  "assignee": "string — optional name or email",
  "priority": "low" | "medium" | "high" | "urgent",
  "sourceMeeting": "string — meeting title or ID this was derived from, if any"
}
<</ACTION_PROPOSAL>>
```

#### Parsing in `OrchestratorAgent.respond`

```typescript
function extractProposals(text: string): { cleanText: string; proposals: ActionProposal[] } {
  const proposalRegex = /<<ACTION_PROPOSAL>>([\s\S]*?)<\/ACTION_PROPOSAL>>/g;
  const proposals: ActionProposal[] = [];
  let cleanText = text;

  let match;
  while ((match = proposalRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      proposals.push({
        actionNoteId: crypto.randomUUID(),
        ...parsed,
        status: "pending",
      });
      cleanText = cleanText.replace(match[0], "").trim();
    } catch {
      // Malformed proposal — ignore, keep text
    }
  }

  return { cleanText, proposals };
}
```

#### Updated system prompt section for action proposals

Add to `ORCHESTRATOR_SYSTEM_PROMPT`:

```
## Action Proposal Format
When the user explicitly asks you to create a Jira ticket, send a Slack message, or perform any external write action:
1. Tell the user what you are about to propose in natural language.
2. Emit exactly one <<ACTION_PROPOSAL>>...<</ ACTION_PROPOSAL>> block per proposed action.
3. Do NOT claim the action was performed. It will be shown to the user for approval.

If the user has not explicitly requested an action but context suggests one is useful, ask before proposing.
```

#### Updated API response shape

```typescript
// message.controller.ts — updated return type
return {
  user_message: userMessage,
  agent_reply: agentReply,
  proposed_actions: proposedActions,  // NEW — may be empty []
};
```

The frontend renders each `proposed_action` as an approval card beneath the agent message. Approval calls `POST /projects/:projectId/meetings/:meetingId/actions/:actionId/execute` (the existing endpoint, unchanged).

**For chat-originated actions that have no associated meeting**, create a lightweight "chat action" record pointing to `chat_id` instead of `meeting_id`. This requires a small schema addition to `MeetingActionItem` or a separate `ChatAction` table — document this as a follow-up task.

---

### 5 — Structured Output Format (Priority: Medium)

**Problem:** The agent returns a plain string. The frontend has to guess where to add bold text, bullet points, or code blocks.

**Solution:** Instruct the agent to always return responses in a defined JSON envelope. The frontend parses this and renders each block type correctly.

#### Response envelope schema

```typescript
// utils/agent.types.ts — add:
export type AgentResponseBlock =
  | { type: "text"; content: string }
  | { type: "bullet_list"; items: string[] }
  | { type: "decision_list"; decisions: Array<{ title: string; context?: string }> }
  | { type: "action_summary"; actions: Array<{ title: string; assignee?: string; dueDate?: string; status: string }> }
  | { type: "proposed_action"; proposal: ActionProposal };

export type StructuredAgentResponse = {
  blocks: AgentResponseBlock[];
  stopReason: string;
};
```

#### System prompt instruction

```
## Response Format
Always reply using this JSON schema wrapped in triple backticks and tagged "json":
{
  "blocks": [
    { "type": "text", "content": "..." },
    { "type": "bullet_list", "items": ["...", "..."] },
    { "type": "decision_list", "decisions": [{ "title": "...", "context": "..." }] },
    { "type": "action_summary", "actions": [{ "title": "...", "assignee": "...", "status": "..." }] }
  ]
}
Use "text" for prose. Use "bullet_list" for lists. Use "decision_list" when recapping decisions.
Use "action_summary" when showing action items. Never mix raw text and JSON in the same reply.
```

#### Parsing in `OrchestratorAgent`

```typescript
function parseStructuredResponse(raw: string): StructuredAgentResponse | null {
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[1]) as StructuredAgentResponse;
  } catch {
    return null;
  }
}

// In OrchestratorAgent.respond:
const rawAnswer = getResponseText(agent);
const structured = parseStructuredResponse(rawAnswer);

return {
  answer: rawAnswer,           // for DynamoDB storage (plain text fallback)
  structured: structured,      // for frontend rendering
  stopReason: result.stopReason,
};
```

#### Updated message API response

```typescript
return {
  user_message: userMessage,
  agent_reply: {
    ...agentReply,
    structured: structured ?? null,  // null → frontend renders message field as markdown
  },
  proposed_actions: proposedActions,
};
```

#### Frontend rendering

```tsx
// In ProjectChatDetailsPage
function AgentMessage({ msg }: { msg: Message & { structured?: StructuredAgentResponse } }) {
  if (!msg.structured) {
    return <p className="chat-text">{msg.message}</p>;
  }
  return (
    <div className="chat-blocks">
      {msg.structured.blocks.map((block, i) => {
        if (block.type === "text") return <p key={i}>{block.content}</p>;
        if (block.type === "bullet_list") return <ul key={i}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
        if (block.type === "decision_list") return <DecisionList key={i} decisions={block.decisions} />;
        if (block.type === "action_summary") return <ActionSummaryTable key={i} actions={block.actions} />;
        return null;
      })}
    </div>
  );
}
```

---

### 6 — Tool Discipline & Token Budget (Priority: Medium)

**Problem:** The agent currently has a flat 16k token budget and 8 turns. Tool calls can blow the budget if the vault search returns dense meeting notes.

**Solution:** Apply per-tool response trimming and tighten the tooling budget per intent.

#### Tool trimming

Wrap vault tool callbacks with a trimmer:

```typescript
const MAX_TOOL_RESPONSE_CHARS = 2_000;

function trimToolResult(result: string): string {
  if (result.length <= MAX_TOOL_RESPONSE_CHARS) return result;
  return result.slice(0, MAX_TOOL_RESPONSE_CHARS) + `\n\n[…truncated — ${result.length} chars total]`;
}
```

#### Intent-based limits

```typescript
const LIMITS_BY_INTENT = {
  LOOKUP: { turns: 6, totalTokens: 24_000 },
  ACTION_REQUEST: { turns: 10, totalTokens: 32_000 },
  CONVERSATION: { turns: 2, totalTokens: 4_000 },
  AMBIGUOUS: { turns: 8, totalTokens: 24_000 },
} as const;

const result = await agent.invoke(message, {
  history: context.history ?? [],
  limits: LIMITS_BY_INTENT[intent],
});
```

#### Tool availability by intent

| Tool | LOOKUP | ACTION_REQUEST | CONVERSATION |
|---|---|---|---|
| `vault_search_notes` | ✓ | ✓ | — |
| `vault_read_note` | ✓ | ✓ | — |
| `vault_get_meeting` | ✓ | ✓ | — |
| `vault_get_action_items` | ✓ | ✓ | — |
| `jira_get_issue` | ✓ | ✓ | — |
| `jira_list_projects` | ✓ | ✓ | — |
| `slack_search_messages` | ✓ | ✓ | — |
| Proposal block in system prompt | — | ✓ | — |

Pass `allowActionProposals: boolean` to `createOrchestratorAgent` and conditionally include the proposal schema section of the system prompt.

---

### 7 — Chat Message Persistence Enhancement (Priority: Low)

**Problem:** The `Message` DynamoDB record only stores `message` (string) and `message_type`. Structured responses and proposals are lost after the first render.

**Solution:** Add two optional fields to the `Message` type:

```typescript
// utils/type.ts — update Message interface:
export interface Message {
  message_id: string;
  chat_id: string;
  message: string;
  message_type: "USER" | "SYSTEM";
  structured_response?: string;   // JSON-encoded StructuredAgentResponse
  proposed_actions?: string;      // JSON-encoded ActionProposal[]
  created_at: string;
  updated_at: string;
}
```

Serialize before saving:

```typescript
const agentReply: Message = {
  message_id: crypto.randomUUID(),
  chat_id: chatId,
  message: cleanAnswer,
  message_type: "SYSTEM",
  structured_response: structured ? JSON.stringify(structured) : undefined,
  proposed_actions: proposedActions.length > 0 ? JSON.stringify(proposedActions) : undefined,
  created_at: replyNow,
  updated_at: replyNow,
};
```

Parse on read in `getAllMessages`:

```typescript
return items
  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  .map((item) => ({
    ...item,
    structured_response: item.structured_response
      ? JSON.parse(item.structured_response)
      : undefined,
    proposed_actions: item.proposed_actions
      ? JSON.parse(item.proposed_actions)
      : undefined,
  }));
```

---

## Implementation Order

| Phase | Work | Files Changed |
|---|---|---|
| 1 | Conversation history — load last N messages and pass to agent | `message.controller.ts`, `orchestrator.agent.ts` |
| 2 | Project context injection — system prefix with project name + meeting summaries | `message.controller.ts`, `orchestrator.agent.ts` |
| 3 | Intent classifier — lightweight Gemini call to route requests | `utils/intent.classifier.ts`, `message.controller.ts` |
| 4 | Action proposals in chat — schema, parser, return from API | `orchestrator.agent.ts`, `message.controller.ts`, `agent.types.ts` |
| 5 | Structured output format — JSON envelope, parser, frontend renderer | `orchestrator.agent.ts`, `agent.types.ts`, frontend `AgentMessage` component |
| 6 | Tool discipline — per-intent limits, response trimmer | `orchestrator.agent.ts` |
| 7 | Message persistence — optional `structured_response` and `proposed_actions` fields | `utils/type.ts`, `message.controller.ts`, `repository/message.repository.ts` |

---

## Full Updated Data Flow

```
POST /api/v1/projects/:projectId/chats/:chatId/messages
  body: { message, jira_credentials?, slack_credentials? }

1. Validate chatId, projectId — load chat + project
2. Load last 10 messages from DynamoDB (conversation history)
3. Load recent meeting summaries for project (last 3)
4. classifyIntent(message) → "LOOKUP" | "ACTION_REQUEST" | ...
5. Save USER message to DynamoDB
6. OrchestratorAgent.respond(message, {
     history,          // prior 10 turns
     projectId,
     projectName,
     meetingSummaries, // 3 × 120-char summaries
     jira?,
     slack?,
     intent,           // controls token limits + tool availability
   })
   ├── buildSystemPrefix(project, meetingSummaries, intent)
   ├── createOrchestratorAgent(context)
   │   ├── vault.createTools() — always
   │   ├── jiraAgent.createTools(creds) — if jira present
   │   ├── slackAgent.createTools(creds) — if slack present
   │   └── system prompt = base + dynamic prefix
   ├── agent.invoke(message, { history, limits: LIMITS_BY_INTENT[intent] })
   ├── extractProposals(rawAnswer) → { cleanText, proposals }
   └── parseStructuredResponse(cleanText) → structured | null
7. Save SYSTEM reply to DynamoDB (with structured_response + proposed_actions)
8. Return {
     user_message,
     agent_reply: { ...message, structured_response, proposed_actions },
     proposed_actions,     // for immediate frontend rendering
   }

Frontend:
  → Renders text (or structured blocks) for the agent reply
  → Renders approval card for each proposed action
  → User clicks approve → POST /projects/:projectId/meetings/:meetingId/actions/:actionId/execute
```

---

## Notes

- **GraphRAG integration:** Once `GRAPH_RAG_IMPLEMENTATION.md` is implemented, step 3 (meeting summaries) is replaced by a Neptune vector search for semantically relevant project context. Pass the result as a `graphContext` string in the system prefix instead of raw summaries.
- **Streaming:** The agent currently returns all-at-once. Future enhancement: use Server-Sent Events (SSE) to stream token-by-token from the Gemini model through the Express response, eliminating the "thinking…" wait state entirely.
- **Rate limiting:** The 200 req/10min global limiter in `index.ts` covers the message endpoint. Consider a separate stricter limiter specifically for `POST .../messages` (e.g., 20 req/min per IP) to prevent agent abuse.
