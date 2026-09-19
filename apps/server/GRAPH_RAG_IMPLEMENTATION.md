# GraphRAG Implementation Plan — OpsNinja

## Overview

This document specifies how AWS Neptune is used as a knowledge graph over meeting transcripts,
MOM (Minutes of Meeting), decisions, actions, and people — per project. The graph is the primary
context source for the chat agent. Every transcript upload updates it. Every agent query reads
from it before answering.

---

## 1. Why GraphRAG Over Plain Vector Search

Vector search gives you semantically similar chunks. It does not give you:

- **Relationships** — "what decisions did Alice drive in Q3" needs edges, not cosine similarity
- **Cross-meeting continuity** — "was the auth refactor from last sprint ever resolved" requires
  traversal across Meeting → Action → Jira nodes
- **Project scoping** — each project is a subgraph; the agent must never bleed context across projects
- **Action provenance** — "who approved the Jira ticket for the payment gateway" needs a path from
  JiraIssue ← Action ← Meeting ← Project ← User

Neptune stores the graph. DynamoDB stores the raw records (existing tables, unchanged). Embeddings
(pgvector or OpenSearch Serverless) sit alongside Neptune for the initial fuzzy chunk retrieval —
then Neptune resolves the relationships.

---

## 2. Graph Schema (Property Graph — openCypher)

### Node Types

```
(:Project {
  project_id: String,          // PK — matches DynamoDB Projects table
  project_name: String,
  created_at: String
})

(:Meeting {
  meeting_id: String,          // PK — matches DynamoDB Meetings table
  project_id: String,          // FK reference
  meeting_platform: String,    // google_meet | zoom | slack | discord
  uploaded_by: String,         // user_id
  date: String,                // extracted from transcript / MOM
  title: String,               // from MOM
  objective: String,           // from MOM
  created_at: String
})

(:MOM {
  record_id: String,           // PK — matches DynamoDB MeetingRecords table
  meeting_id: String,
  summary: String,             // full MOM summary text
  embedding_id: String,        // pointer to vector store chunk ID
  created_at: String
})

(:Participant {
  name: String,                // normalised display name from transcript
  email: String?               // if resolvable from Users table
})

(:Decision {
  decision_id: String,         // generated UUID
  meeting_id: String,
  text: String,                // decision statement from MOM
  made_at: String              // inherited from meeting date
})

(:ActionItem {
  action_id: String,           // PK — matches DynamoDB Actions table
  title: String,
  description: String?,
  assignee: String?,           // name from transcript
  due_date: String?,
  priority: String,            // low | medium | high | urgent
  status: String,              // pending | success | failed | un_initialized | initialized
  external_action: String,     // none | jira | slack
  target: String?              // Jira project key or Slack channel
})

(:JiraIssue {
  issue_key: String,           // e.g. "OPS-42"
  summary: String,
  jira_url: String?,
  created_at: String
})

(:SlackMessage {
  slack_ts: String,            // Slack message timestamp (unique)
  channel: String,
  text: String,
  sent_at: String
})

(:Topic {
  name: String                 // normalised topic slug from relatedTopics array in MOM
})
```

### Edge Types

```
(:Project)-[:HAS_MEETING]->(:Meeting)
(:Meeting)-[:PRODUCED_MOM]->(:MOM)
(:Meeting)-[:HAD_PARTICIPANT]->(:Participant)
(:Meeting)-[:MADE_DECISION]->(:Decision)
(:Meeting)-[:GENERATED_ACTION]->(:ActionItem)
(:ActionItem)-[:CREATED_ISSUE]->(:JiraIssue)
(:ActionItem)-[:SENT_MESSAGE]->(:SlackMessage)
(:ActionItem)-[:ASSIGNED_TO]->(:Participant)
(:Decision)-[:INVOLVES_TOPIC]->(:Topic)
(:Meeting)-[:COVERS_TOPIC]->(:Topic)
(:MOM)-[:FOLLOWS_UP]->(:Meeting)        // when followUp.purpose references a prior meeting
(:Meeting)-[:PRECEDED_BY]->(:Meeting)   // temporal chain within the same project
```

### Index Plan

Neptune property graph indexes to create at bootstrap:

```
CREATE INDEX ON :Meeting(project_id)
CREATE INDEX ON :Meeting(date)
CREATE INDEX ON :ActionItem(status)
CREATE INDEX ON :ActionItem(external_action)
CREATE INDEX ON :Participant(name)
CREATE INDEX ON :Topic(name)
```

---

## 3. Data Flow: Full User Journey

### 3.1 Transcript Upload (POST /api/v1/projects/:projectId/meetings)

```
Frontend
  │
  ▼
Route: meeting.route.ts
  │ body: { meeting_platform, original_transcript }
  │ auth: authenticate middleware → req.user.user_id
  ▼
meetingController.uploadTranscript(projectId, dto)
  │
  ├─ 1. meetingRepository.createMeeting(...)
  │       → DynamoDB Meetings table (stores raw transcript)
  │
  ├─ 2. meetingWorkflowService.ingestTranscript(transcript)
  │       │
  │       ├─ transcriptAgent.createMinutes(transcript)
  │       │     → Gemini LLM call → MeetingMinutes object
  │       │       { title, date, participants[], summary, decisions[],
  │       │         actionItems[], relatedTopics[], followUp? }
  │       │
  │       ├─ vaultService.saveMeetingMinutes(minutes)
  │       │     → writes Obsidian .md file (existing behaviour, unchanged)
  │       │
  │       └─ vaultService.saveActionNote(action, meetingNoteId) × N
  │             → writes action .md files (existing behaviour, unchanged)
  │
  ├─ 3. meetingRecordRepository.createRecord(...)
  │       → DynamoDB MeetingRecords table (stores summary text)
  │
  ├─ 4. actionRepository.createAction(...) × N
  │       → DynamoDB Actions table (one row per action item)
  │
  └─ 5. [NEW] graphService.indexMeeting(projectId, meetingId, recordId, minutes)
            │
            ├─ a. Upsert (:Project {project_id}) if not exists
            ├─ b. Create (:Meeting {meeting_id, ...})
            ├─ c. Create (:MOM {record_id, summary, embedding_id})
            │         → also calls embeddingService.embed(summary) → stores in vector store,
            │           saves returned chunk_id as embedding_id on the MOM node
            ├─ d. MERGE (:Participant {name}) for each participant
            │         → CREATE (:Meeting)-[:HAD_PARTICIPANT]->(:Participant)
            ├─ e. CREATE (:Decision {text}) × decisions.length
            │         → CREATE (:Meeting)-[:MADE_DECISION]->(:Decision)
            ├─ f. MERGE (:Topic {name}) for each relatedTopic
            │         → CREATE (:Meeting)-[:COVERS_TOPIC]->(:Topic)
            ├─ g. CREATE (:ActionItem {action_id, ...}) for each actionItem
            │         → CREATE (:Meeting)-[:GENERATED_ACTION]->(:ActionItem)
            │         → if assignee: MERGE (:Participant) + [:ASSIGNED_TO]
            ├─ h. Link temporal chain:
            │         MATCH last Meeting in project by date → [:PRECEDED_BY] edge
            └─ i. Link project edge:
                      CREATE (:Project)-[:HAS_MEETING]->(:Meeting)

Response to frontend:
  { meeting, summary, proposals[] }
```

### 3.2 Action Execution (POST /api/v1/projects/:projectId/meetings/:meetingId/actions/:actionId/execute)

```
actionController.executeAction(actionId, approvedBy, proposal, credentials)
  │
  ├─ meetingWorkflowService.executeApprovedAction(...)
  │     → calls jiraService.createIssue / slackService.sendMessage
  │
  ├─ actionRepository.updateAction(actionId, { action_status: "success" })
  │
  └─ [NEW] graphService.linkActionResult(actionId, result)
            │
            ├─ if result.type === "jira":
            │     CREATE (:JiraIssue {issue_key, summary, jira_url})
            │     MATCH (:ActionItem {action_id}) 
            │     CREATE [:CREATED_ISSUE]->(:JiraIssue)
            │     UPDATE :ActionItem { status: "success" }
            └─ if result.type === "slack":
                  CREATE (:SlackMessage {slack_ts, channel, text})
                  MATCH (:ActionItem {action_id})
                  CREATE [:SENT_MESSAGE]->(:SlackMessage)
                  UPDATE :ActionItem { status: "success" }
```

---

## 4. Data Flow: Chat Query (POST /api/v1/projects/:projectId/chats/:chatId/messages)

```
Frontend
  │
  ▼
Route: message.route.ts
  │ body: { message: "What were the decisions from last week's auth meeting?" }
  ▼
messageController.sendMessage(chatId, text, userId)
  │
  ├─ 1. Load last 12 messages from DynamoDB (conversation history)
  │
  ├─ 2. Load user integrations from DynamoDB (jira/slack credentials)
  │
  ├─ 3. Resolve projectId from chatId → chatRepository.findChatById(chatId)
  │
  ├─ 4. [NEW] graphService.getProjectContext(projectId, text)
  │         │
  │         │  This is the GraphRAG retrieval step:
  │         │
  │         ├─ a. Embed the user's query → vector store similarity search
  │         │       → returns top-K MOM chunk_ids (embedding_ids)
  │         │
  │         ├─ b. Neptune: MATCH (:MOM) WHERE embedding_id IN [chunk_ids]
  │         │              <-[:PRODUCED_MOM]-(:Meeting)-[:HAS_MEETING*0..1]-(:Project)
  │         │       → resolve to Meeting nodes
  │         │
  │         ├─ c. For each matched Meeting — expand neighbourhood (1-2 hops):
  │         │       MATCH (m:Meeting {meeting_id: $id})
  │         │       OPTIONAL MATCH (m)-[:MADE_DECISION]->(d:Decision)
  │         │       OPTIONAL MATCH (m)-[:GENERATED_ACTION]->(a:ActionItem)
  │         │       OPTIONAL MATCH (a)-[:CREATED_ISSUE]->(j:JiraIssue)
  │         │       OPTIONAL MATCH (m)-[:HAD_PARTICIPANT]->(p:Participant)
  │         │       OPTIONAL MATCH (m)-[:COVERS_TOPIC]->(t:Topic)
  │         │       RETURN m, collect(d), collect(a), collect(j), collect(p), collect(t)
  │         │
  │         └─ d. Serialize into a compact context block:
  │                 {
  │                   project_id,
  │                   relevant_meetings: [{
  │                     meeting_id, title, date, participants[],
  │                     summary (from MOM node),
  │                     decisions[], action_items[], jira_issues[]
  │                   }],
  │                   topics_mentioned: []
  │                 }
  │
  ├─ 5. orchestratorAgent.respond(chatId, text, {
  │         jira, slack,
  │         graphContext   // <-- injected into system prompt prefix
  │       })
  │         │
  │         │  Agent system prompt now starts with:
  │         │  "--- PROJECT CONTEXT (from knowledge graph) ---
  │         │   [serialized graphContext JSON]
  │         │   --- END CONTEXT ---
  │         │   Answer using the above context as your primary source of truth.
  │         │   Only call vault/jira/slack tools if the context above is insufficient."
  │         │
  │         └─ Agent responds with structured AgentResponse
  │
  ├─ 6. Save user message + agent reply to DynamoDB Messages table
  │
  └─ 7. Return { user_message, agent_reply } to frontend
```

---

## 5. Neptune Infrastructure

### Connection

```typescript
// utils/neptune.ts
import { NeptuneGraph } from "@aws-sdk/client-neptune-graph";
import { requireConfigValue } from "./config";

let client: NeptuneGraph | null = null;

export const getNeptuneClient = () => {
  if (!client) {
    client = new NeptuneGraph({
      region: requireConfigValue("AWS_NEPTUNE_REGION"),
      endpoint: requireConfigValue("AWS_NEPTUNE_ENDPOINT"),
    });
  }
  return client;
};

export const runQuery = async (query: string, params: Record<string, unknown> = {}) => {
  const client = getNeptuneClient();
  const result = await client.executeQuery({
    graphIdentifier: requireConfigValue("AWS_NEPTUNE_GRAPH_ID"),
    queryString: query,
    language: "OPEN_CYPHER",
    parameters: params,
  });
  return result.payload;
};
```

### Secrets Manager Keys to Add

| Key | Value |
|-----|-------|
| `AWS_NEPTUNE_REGION` | AWS region where Neptune Analytics graph lives |
| `AWS_NEPTUNE_ENDPOINT` | Neptune Analytics endpoint URL |
| `AWS_NEPTUNE_GRAPH_ID` | Graph identifier (Neptune Analytics graph ID) |
| `EMBEDDING_API_KEY` | Key for embedding model (Gemini text-embedding-004) |

> **Neptune Analytics** (not Neptune Database) is used — it supports openCypher, vector similarity
> search natively, and has no server to manage (serverless, pay-per-query). This removes the need
> for a separate vector store entirely: Neptune Analytics stores both the graph edges and the
> embedding vectors on the same node.

---

## 6. Embedding Strategy

Neptune Analytics supports **vector properties** on nodes. The MOM summary is embedded once at
index time and stored directly on the `:MOM` node:

```cypher
// At index time (graphService.indexMeeting step c)
MERGE (mom:MOM {record_id: $record_id})
SET mom.summary = $summary,
    mom.embedding = $embedding_vector,   // float[] stored as Neptune vector property
    mom.created_at = $created_at

// At query time (graphService.getProjectContext step a+b combined)
CALL neptune.algo.vectors.topKByNode(
  $query_embedding,
  {nodeLabel: 'MOM', limit: 5, efs: 50}
) YIELD node, score
MATCH (node)<-[:PRODUCED_MOM]-(m:Meeting)<-[:HAS_MEETING]-(p:Project {project_id: $project_id})
RETURN m, node.summary, score
ORDER BY score DESC
```

This replaces external pgvector/OpenSearch — one graph, one query, both semantic retrieval and
relationship expansion in a single round trip.

---

## 7. GraphService Interface

```typescript
// service/graph.service.ts

export interface MeetingGraphInput {
  projectId: string;
  meetingId: string;
  recordId: string;
  minutes: MeetingMinutes;
  summaryEmbedding: number[];   // pre-computed float[] from embeddingService
}

export interface GraphContext {
  project_id: string;
  relevant_meetings: Array<{
    meeting_id: string;
    title: string;
    date?: string;
    participants: string[];
    summary: string;
    decisions: string[];
    action_items: Array<{
      title: string;
      assignee?: string;
      status: string;
      jira_issue?: string;
    }>;
  }>;
  topics_mentioned: string[];
}

class GraphService {
  async indexMeeting(input: MeetingGraphInput): Promise<void>
  async linkActionResult(actionId: string, result: JiraResult | SlackResult): Promise<void>
  async getProjectContext(projectId: string, queryEmbedding: number[]): Promise<GraphContext>
}
```

---

## 8. EmbeddingService Interface

```typescript
// service/embedding.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireConfigValue } from "../utils/config";

class EmbeddingService {
  private model = new GoogleGenerativeAI(requireConfigValue("EMBEDDING_API_KEY"))
    .getGenerativeModel({ model: "text-embedding-004" });

  async embed(text: string): Promise<number[]> {
    const result = await this.model.embedContent(text);
    return result.embedding.values;
  }
}

export default new EmbeddingService();
```

Used by:
- `meetingController.uploadTranscript` → embed summary → pass to `graphService.indexMeeting`
- `messageController.sendMessage` → embed user query → pass to `graphService.getProjectContext`

---

## 9. Agent Context Injection

The `graphContext` block is injected as a dynamic prefix to the orchestrator's system prompt at
call time — not hardcoded. The agent's static system prompt stays unchanged. The controller builds:

```typescript
const contextPrefix = graphContext
  ? `--- PROJECT KNOWLEDGE GRAPH CONTEXT ---\n${JSON.stringify(graphContext, null, 2)}\n--- END CONTEXT ---\n\nUse the above as your primary source of truth. Reference meeting titles and dates when citing decisions or actions. Only call vault/Jira/Slack tools if the graph context is insufficient or the user asks for real-time data.\n\n`
  : "";

const { answer } = await orchestratorAgent.respond(chatId, text, {
  jira, slack,
  systemPrefix: contextPrefix,
});
```

Inside `orchestrator.agent.ts`, the agent is constructed as:

```typescript
new Agent({
  systemPrompt: context.systemPrefix + ORCHESTRATOR_SYSTEM_PROMPT,
  ...
})
```

---

## 10. Files to Create / Modify

### New Files

| File | Purpose |
|------|---------|
| `apps/server/utils/neptune.ts` | Neptune client singleton + `runQuery` helper |
| `apps/server/service/graph.service.ts` | `indexMeeting`, `linkActionResult`, `getProjectContext` |
| `apps/server/service/embedding.service.ts` | Gemini `text-embedding-004` wrapper |

### Modified Files

| File | Change |
|------|--------|
| `apps/server/controllers/meeting.controller.ts` | Call `embeddingService.embed(summary)` then `graphService.indexMeeting(...)` after MOM is created |
| `apps/server/controllers/action.controller.ts` | Call `graphService.linkActionResult(actionId, result)` after `executeApprovedAction` succeeds |
| `apps/server/controllers/message.controller.ts` | Resolve projectId from chat, call `embeddingService.embed(text)`, call `graphService.getProjectContext(projectId, embedding)`, inject `systemPrefix` into agent call |
| `apps/server/agent/orchestrator.agent.ts` | Accept `systemPrefix` in `OrchestratorContext`, prepend to static system prompt |

### No Schema Changes to DynamoDB

All existing DynamoDB tables remain unchanged. Neptune is additive — it indexes what DynamoDB stores
but is not a replacement. If Neptune is unavailable, the agent falls back to vault search alone.

---

## 11. Cypher Queries Reference

### Insert Meeting Node

```cypher
MERGE (proj:Project {project_id: $project_id})
ON CREATE SET proj.created_at = $now

CREATE (m:Meeting {
  meeting_id: $meeting_id,
  project_id: $project_id,
  title: $title,
  date: $date,
  objective: $objective,
  meeting_platform: $platform,
  uploaded_by: $uploaded_by,
  created_at: $now
})

CREATE (mom:MOM {
  record_id: $record_id,
  meeting_id: $meeting_id,
  summary: $summary,
  embedding: $embedding_vector,
  created_at: $now
})

CREATE (proj)-[:HAS_MEETING]->(m)
CREATE (m)-[:PRODUCED_MOM]->(mom)
```

### Insert Participants

```cypher
UNWIND $participants AS name
MERGE (p:Participant {name: name})
WITH p, $meeting_id AS mid
MATCH (m:Meeting {meeting_id: mid})
MERGE (m)-[:HAD_PARTICIPANT]->(p)
```

### Insert Decisions

```cypher
UNWIND $decisions AS decText
CREATE (d:Decision {
  decision_id: randomUUID(),
  meeting_id: $meeting_id,
  text: decText,
  made_at: $date
})
WITH d, $meeting_id AS mid
MATCH (m:Meeting {meeting_id: mid})
CREATE (m)-[:MADE_DECISION]->(d)
```

### Insert Action Items

```cypher
UNWIND $actions AS a
CREATE (ai:ActionItem {
  action_id: a.action_id,
  title: a.title,
  description: a.description,
  assignee: a.assignee,
  due_date: a.due_date,
  priority: a.priority,
  status: 'pending',
  external_action: a.external_action,
  target: a.target
})
WITH ai, a, $meeting_id AS mid
MATCH (m:Meeting {meeting_id: mid})
CREATE (m)-[:GENERATED_ACTION]->(ai)
WITH ai, a
WHERE a.assignee IS NOT NULL
MERGE (p:Participant {name: a.assignee})
CREATE (ai)-[:ASSIGNED_TO]->(p)
```

### Link Jira Issue After Execution

```cypher
MATCH (ai:ActionItem {action_id: $action_id})
CREATE (j:JiraIssue {
  issue_key: $issue_key,
  summary: $summary,
  jira_url: $jira_url,
  created_at: $now
})
CREATE (ai)-[:CREATED_ISSUE]->(j)
SET ai.status = 'success'
```

### Temporal Chain (Link to Previous Meeting)

```cypher
MATCH (prev:Meeting)-[:HAS_MEETING*0..]-(:Project {project_id: $project_id})
WHERE prev.meeting_id <> $meeting_id
  AND prev.date <= $date
WITH prev ORDER BY prev.date DESC LIMIT 1
MATCH (curr:Meeting {meeting_id: $meeting_id})
CREATE (curr)-[:PRECEDED_BY]->(prev)
```

### Semantic Retrieval + Graph Expansion (Agent Query)

```cypher
CALL neptune.algo.vectors.topKByNode(
  $query_embedding,
  {nodeLabel: 'MOM', limit: 5, efs: 50}
) YIELD node AS mom, score

MATCH (mom)<-[:PRODUCED_MOM]-(m:Meeting)<-[:HAS_MEETING]-(proj:Project {project_id: $project_id})

OPTIONAL MATCH (m)-[:MADE_DECISION]->(d:Decision)
OPTIONAL MATCH (m)-[:GENERATED_ACTION]->(ai:ActionItem)
OPTIONAL MATCH (ai)-[:CREATED_ISSUE]->(j:JiraIssue)
OPTIONAL MATCH (ai)-[:SENT_MESSAGE]->(sm:SlackMessage)
OPTIONAL MATCH (m)-[:HAD_PARTICIPANT]->(p:Participant)
OPTIONAL MATCH (m)-[:COVERS_TOPIC]->(t:Topic)

RETURN
  m.meeting_id AS meeting_id,
  m.title AS title,
  m.date AS date,
  mom.summary AS summary,
  score,
  collect(DISTINCT d.text) AS decisions,
  collect(DISTINCT {
    title: ai.title,
    assignee: ai.assignee,
    status: ai.status,
    jira_issue: j.issue_key
  }) AS action_items,
  collect(DISTINCT p.name) AS participants,
  collect(DISTINCT t.name) AS topics

ORDER BY score DESC
```

---

## 12. Fallback Strategy

If Neptune is unavailable or returns empty results:

1. `graphService.getProjectContext` returns `null`
2. `messageController` detects `null` → skips context injection
3. Agent is called without `systemPrefix` — falls back to vault `search_vault` tool
4. Response is still valid, just less contextually rich

This ensures the chat endpoint never fails due to Neptune being cold or unreachable.

---

## 13. Implementation Order

```
Phase 1 — Infrastructure
  1a. utils/neptune.ts         — Neptune Analytics client + runQuery
  1b. service/embedding.service.ts  — Gemini text-embedding-004 wrapper
  1c. service/graph.service.ts      — stub with all 3 methods returning void/empty

Phase 2 — Indexing Pipeline
  2a. graph.service.ts → implement indexMeeting (all Cypher inserts)
  2b. meeting.controller.ts → call embed + indexMeeting after createRecord
  2c. action.controller.ts → call linkActionResult after executeApprovedAction

Phase 3 — Retrieval + Agent Context
  3a. graph.service.ts → implement getProjectContext (vector search + expansion)
  3b. message.controller.ts → embed query + getProjectContext + build systemPrefix
  3c. orchestrator.agent.ts → accept + prepend systemPrefix

Phase 4 — Validation
  4a. Upload a test transcript → verify Neptune nodes via AWS console graph explorer
  4b. Chat: ask about the transcript → verify graph context appears in agent prompt
  4c. Execute an action → verify :JiraIssue node is linked
  4d. Upload second meeting → verify :PRECEDED_BY edge and temporal continuity in answers
```
