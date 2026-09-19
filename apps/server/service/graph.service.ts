import { runQuery } from "../utils/neptune";
import type { MeetingMinutes } from "../utils/agent.types";

export interface MeetingGraphInput {
  projectId: string;
  meetingId: string;
  recordId: string;
  minutes: MeetingMinutes;
  summaryEmbedding: number[];
}

export interface GraphContext {
  meetings: Array<{
    meetingId: string;
    summary: string;
    date?: string;
    participants: string[];
    decisions: string[];
  }>;
  recentActions: Array<{
    actionId: string;
    title: string;
    assignee?: string;
    status: string;
  }>;
}

class GraphService {
  async indexMeeting(input: MeetingGraphInput): Promise<void> {
    const { projectId, meetingId, recordId, minutes, summaryEmbedding } =
      input;

    // Upsert Project node
    await runQuery(
      `MERGE (p:Project {projectId: $projectId})
       ON CREATE SET p.createdAt = timestamp()`,
      { projectId },
    );

    // Create Meeting node
    await runQuery(
      `MATCH (p:Project {projectId: $projectId})
       MERGE (m:Meeting {meetingId: $meetingId})
       ON CREATE SET m.date = $date, m.title = $title, m.createdAt = timestamp()
       MERGE (p)-[:HAS_MEETING]->(m)`,
      {
        projectId,
        meetingId,
        date: minutes.date ?? "",
        title: minutes.title,
      },
    );

    // Create MOM (Minutes of Meeting) node with embedding
    await runQuery(
      `MATCH (m:Meeting {meetingId: $meetingId})
       MERGE (mom:MOM {recordId: $recordId})
       ON CREATE SET mom.summary = $summary, mom.embedding = $embedding, mom.createdAt = timestamp()
       MERGE (m)-[:HAS_MOM]->(mom)`,
      {
        meetingId,
        recordId,
        summary: minutes.summary,
        embedding: summaryEmbedding,
      },
    );

    // UNWIND participants
    if (minutes.participants.length > 0) {
      await runQuery(
        `MATCH (m:Meeting {meetingId: $meetingId})
         UNWIND $participants AS name
         MERGE (p:Participant {name: name})
         MERGE (m)-[:HAD_PARTICIPANT]->(p)`,
        { meetingId, participants: minutes.participants },
      );
    }

    // UNWIND decisions
    if (minutes.decisions.length > 0) {
      await runQuery(
        `MATCH (m:Meeting {meetingId: $meetingId})
         UNWIND $decisions AS text
         CREATE (d:Decision {text: text, meetingId: $meetingId, createdAt: timestamp()})
         MERGE (m)-[:MADE_DECISION]->(d)`,
        { meetingId, decisions: minutes.decisions },
      );
    }

    // UNWIND action items + assignees
    if (minutes.actionItems.length > 0) {
      await runQuery(
        `MATCH (m:Meeting {meetingId: $meetingId})
         UNWIND $actions AS action
         MERGE (ai:ActionItem {actionSlug: action.id, meetingId: $meetingId})
         ON CREATE SET ai.title = action.title,
                       ai.description = coalesce(action.description, ''),
                       ai.priority = action.priority,
                       ai.externalAction = action.externalAction,
                       ai.status = 'pending',
                       ai.createdAt = timestamp()
         MERGE (m)-[:HAS_ACTION]->(ai)
         WITH ai, action
         WHERE action.assignee IS NOT NULL AND action.assignee <> ''
         MERGE (p:Participant {name: action.assignee})
         MERGE (ai)-[:ASSIGNED_TO]->(p)`,
        {
          meetingId,
          actions: minutes.actionItems.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description ?? "",
            priority: a.priority,
            externalAction: a.externalAction,
            assignee: a.assignee ?? null,
          })),
        },
      );
    }

    // Link temporal :PRECEDED_BY chain — find the last meeting for this project
    await runQuery(
      `MATCH (p:Project {projectId: $projectId})-[:HAS_MEETING]->(prev:Meeting)
       WHERE prev.meetingId <> $meetingId
       WITH prev ORDER BY prev.createdAt DESC LIMIT 1
       MATCH (curr:Meeting {meetingId: $meetingId})
       MERGE (curr)-[:PRECEDED_BY]->(prev)`,
      { projectId, meetingId },
    );
  }

  async linkActionResult(
    actionId: string,
    result: unknown,
  ): Promise<void> {
    const res = result as Record<string, unknown>;
    const isJira = res && typeof res === "object" && "issueKey" in res;
    const isSlack = res && typeof res === "object" && "ts" in res;

    if (isJira) {
      const issueKey = res.issueKey as string;
      const issueUrl = (res.url ?? res.issueUrl ?? "") as string;
      await runQuery(
        `MATCH (ai:ActionItem {actionSlug: $actionId})
         CREATE (ji:JiraIssue {issueKey: $issueKey, url: $issueUrl, createdAt: timestamp()})
         MERGE (ai)-[:CREATED_ISSUE]->(ji)
         SET ai.status = 'success'`,
        { actionId, issueKey, issueUrl },
      );
    } else if (isSlack) {
      const ts = res.ts as string;
      const channel = (res.channel ?? "") as string;
      await runQuery(
        `MATCH (ai:ActionItem {actionSlug: $actionId})
         CREATE (sm:SlackMessage {ts: $ts, channel: $channel, createdAt: timestamp()})
         MERGE (ai)-[:SENT_MESSAGE]->(sm)
         SET ai.status = 'success'`,
        { actionId, ts, channel },
      );
    } else {
      await runQuery(
        `MATCH (ai:ActionItem {actionSlug: $actionId})
         SET ai.status = 'success'`,
        { actionId },
      );
    }
  }

  async getProjectContext(
    projectId: string,
    queryEmbedding: number[],
  ): Promise<GraphContext | null> {
    try {
      // Vector similarity search for top MOM nodes, then expand graph
      const rows = await runQuery<{
        meetingId: string;
        summary: string;
        date: string;
        participants: string[];
        decisions: string[];
        actionSlug: string;
        actionTitle: string;
        assignee: string;
        actionStatus: string;
      }>(
        `MATCH (p:Project {projectId: $projectId})-[:HAS_MEETING]->(m:Meeting)-[:HAS_MOM]->(mom:MOM)
         WITH m, mom,
              reduce(dot = 0.0, i IN range(0, size(mom.embedding)-1) |
                dot + mom.embedding[i] * $queryEmbedding[i]) /
              (sqrt(reduce(a = 0.0, x IN mom.embedding | a + x*x)) *
               sqrt(reduce(b = 0.0, y IN $queryEmbedding | b + y*y)) + 0.000001) AS score
         ORDER BY score DESC LIMIT 3
         OPTIONAL MATCH (m)-[:HAD_PARTICIPANT]->(part:Participant)
         OPTIONAL MATCH (m)-[:MADE_DECISION]->(d:Decision)
         OPTIONAL MATCH (m)-[:HAS_ACTION]->(ai:ActionItem)
         OPTIONAL MATCH (ai)-[:ASSIGNED_TO]->(assignee:Participant)
         RETURN m.meetingId AS meetingId,
                mom.summary AS summary,
                m.date AS date,
                collect(DISTINCT part.name) AS participants,
                collect(DISTINCT d.text) AS decisions,
                coalesce(ai.actionSlug, '') AS actionSlug,
                coalesce(ai.title, '') AS actionTitle,
                coalesce(assignee.name, '') AS assignee,
                coalesce(ai.status, '') AS actionStatus`,
        { projectId, queryEmbedding },
      );

      if (!rows.length) return null;

      // Group rows by meetingId
      const meetingMap = new Map<
        string,
        GraphContext["meetings"][number]
      >();
      const actionMap = new Map<
        string,
        GraphContext["recentActions"][number]
      >();

      for (const row of rows) {
        if (!meetingMap.has(row.meetingId)) {
          meetingMap.set(row.meetingId, {
            meetingId: row.meetingId,
            summary: row.summary,
            date: row.date,
            participants: row.participants ?? [],
            decisions: row.decisions ?? [],
          });
        }
        if (row.actionSlug) {
          actionMap.set(row.actionSlug, {
            actionId: row.actionSlug,
            title: row.actionTitle,
            assignee: row.assignee || undefined,
            status: row.actionStatus,
          });
        }
      }

      return {
        meetings: Array.from(meetingMap.values()),
        recentActions: Array.from(actionMap.values()),
      };
    } catch {
      return null;
    }
  }
}

export default new GraphService();
