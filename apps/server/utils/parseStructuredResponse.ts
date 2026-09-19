export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "bullet_list"; items: string[] }
  | { type: "decision_list"; items: string[] }
  | { type: "action_summary"; actions: { title: string; assignee?: string; status?: string }[] };

export interface AgentResponse {
  blocks: ContentBlock[];
}

export function parseStructuredResponse(raw: string): AgentResponse {
  try {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) ||
      raw.match(/\{[\s\S]*"blocks"[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : raw.trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed as AgentResponse;
    }
  } catch {
    // fall through to plain text fallback
  }
  return { blocks: [{ type: "text", content: raw }] };
}
