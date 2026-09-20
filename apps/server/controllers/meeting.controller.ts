import crypto from "crypto";
import meetingRepository from "../repository/meeting.repository";
import meetingRecordRepository from "../repository/meetingRecord.repository";
import actionRepository from "../repository/action.repository";
import meetingWorkflowService from "../service/meetingWorkflow.service";
import embeddingService from "../service/embedding.service";
import graphService from "../service/graph.service";
import type {
  Meeting,
  CreateMeetingDTO,
  MeetingRecord,
  MeetingActionItem,
} from "../utils/type";
import type { ActionProposal } from "../utils/agent.types";

class MeetingController {
  async uploadTranscript(
    projectId: string,
    dto: Omit<CreateMeetingDTO, "project_id">,
  ): Promise<
    Meeting & {
      shortname: string;
      description: string;
      actions: MeetingRecord["actions"];
      proposals: ActionProposal[];
    }
  > {
    if (!projectId) throw new Error("projectId is required");
    if (!dto.uploaded_by) throw new Error("uploaded_by is required");
    if (!dto.meeting_platform) throw new Error("meeting_platform is required");
    if (!dto.original_transcript?.trim())
      throw new Error("original_transcript is required");

    console.log(
      `[MeetingController] Processing transcript (${dto.original_transcript.length} chars)`,
    );

    let workflowResult: Awaited<
      ReturnType<typeof meetingWorkflowService.ingestTranscript>
    >;
    try {
      workflowResult = await meetingWorkflowService.ingestTranscript(
        dto.original_transcript,
      );
      console.log(
        `[MeetingController] Transcript processed successfully: ${workflowResult.minutes.actionItems.length} action items, ${workflowResult.proposals.length} proposals`,
      );
    } catch (error) {
      console.error(
        `[MeetingController] Failed to ingest transcript:`,
        error,
      );
      throw error;
    }

    // Do not leave an upload in the meeting list until it has a MOM. This keeps
    // the UI's "MOM ready" state truthful when the model provider is unavailable.
    const now = new Date().toISOString();
    const meeting: Meeting = {
      meeting_id: crypto.randomUUID(),
      project_id: projectId,
      uploaded_by: dto.uploaded_by,
      meeting_platform: dto.meeting_platform,
      original_transcript: dto.original_transcript,
      created_at: now,
      updated_at: now,
    };
    await meetingRepository.createMeeting(meeting);

    const recordNow = new Date().toISOString();
    const record: MeetingRecord = {
      record_id: crypto.randomUUID(),
      meeting_id: meeting.meeting_id,
      shortname: workflowResult.shortname,
      description: workflowResult.description,
      actions: workflowResult.actions,
      created_at: recordNow,
      updated_at: recordNow,
    };

    try {
      await meetingRecordRepository.createRecord(record);
    } catch (error) {
      // Best-effort compensation avoids a meeting that cannot be opened as a MOM.
      await meetingRepository.deleteMeeting(meeting.meeting_id).catch(() => undefined);
      throw error;
    }

    for (const extractedAction of workflowResult.actions) {
      const actionNow = new Date().toISOString();
      const action: MeetingActionItem = {
        action_id: crypto.randomUUID(),
        meeting_id: meeting.meeting_id,
        action_by: dto.uploaded_by,
        action_status:
          extractedAction.externalAction === "none"
            ? "un_initialized"
            : "pending",
        action_type:
          extractedAction.externalAction === "jira"
            ? "create_jira_issue"
            : extractedAction.externalAction === "slack"
              ? "send_slack_message"
              : "create_calendar_event",
        integration_platform:
          extractedAction.externalAction === "jira"
            ? "jira"
            : extractedAction.externalAction === "slack"
              ? "slack"
              : "calendar",
        title: extractedAction.title,
        description: extractedAction.description,
        assignee: extractedAction.assignee,
        due_date: extractedAction.dueDate,
        priority: extractedAction.priority,
        target: extractedAction.target,
        created_at: actionNow,
        updated_at: actionNow,
      };
      await actionRepository.createAction(action);
    }

    // Graph retrieval enriches chat, but it must never hold the user-facing
    // upload open. It continues after DynamoDB has safely stored the MOM.
    void this.indexMeetingInBackground({
      projectId,
      meetingId: meeting.meeting_id,
      recordId: record.record_id,
      shortname: workflowResult.shortname,
      description: workflowResult.description,
      minutes: workflowResult.minutes,
    });

    return {
      ...meeting,
      shortname: workflowResult.shortname,
      description: workflowResult.description,
      actions: workflowResult.actions,
      proposals: workflowResult.proposals,
    };
  }

  private async indexMeetingInBackground(input: {
    projectId: string;
    meetingId: string;
    recordId: string;
    shortname: string;
    description: string;
    minutes: Awaited<ReturnType<typeof meetingWorkflowService.ingestTranscript>>["minutes"];
  }) {
    console.log(`[MeetingController] Starting Neptune graph indexing for meetingId=${input.meetingId} recordId=${input.recordId}`);
    try {
      console.log(`[MeetingController] Generating embedding for: "${input.shortname}"`);
      const summaryEmbedding = await Promise.race([
        embeddingService.embed([input.shortname, input.description].join("\n\n")),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Embedding request timed out after 8s")), 8_000),
        ),
      ]);

      if (!summaryEmbedding.length) {
        console.warn(`[MeetingController] Embedding returned empty array — skipping graph indexing for ${input.meetingId}`);
        return;
      }

      console.log(`[MeetingController] Embedding generated (${summaryEmbedding.length} dimensions). Indexing in Neptune...`);
      await graphService.indexMeeting({
        projectId: input.projectId,
        meetingId: input.meetingId,
        recordId: input.recordId,
        minutes: input.minutes,
        summaryEmbedding,
      });
      console.log(`[MeetingController] ✓ Transcript successfully indexed in Neptune (meetingId=${input.meetingId})`);
    } catch (error) {
      // Graph indexing is best-effort — do not crash the server.
      console.error(`[MeetingController] Neptune indexing FAILED for meetingId=${input.meetingId}:`, error);
    }
  }

  async getAllMeetings(
    projectId: string,
  ): Promise<(Meeting & Partial<MeetingRecord>)[]> {
    if (!projectId) throw new Error("projectId is required");
    const meetings = await meetingRepository.findMeetingsByProjectId(projectId);

    const meetingsWithSummary = await Promise.all(
      meetings.map(async (meeting) => {
        try {
          const records = await meetingRecordRepository.findRecordsByMeetingId(
            meeting.meeting_id,
          );
          const record = records[0];
          return {
            ...meeting,
            shortname: record?.shortname || "Meeting Record",
            description: record?.description || "",
            actions: record?.actions || [],
          };
        } catch (error) {
          console.warn(
            `[MeetingController] Failed to get summary for meeting ${meeting.meeting_id}:`,
            error,
          );
          return {
            ...meeting,
            shortname: "Meeting Record",
            description: "",
            actions: [],
          };
        }
      }),
    );

    return meetingsWithSummary;
  }

  async getMeeting(meetingId: string): Promise<{
    meeting: Meeting;
    record: MeetingRecord | null;
    actions: MeetingActionItem[];
  }> {
    if (!meetingId) throw new Error("meetingId is required");

    const meeting = await meetingRepository.findMeetingById(meetingId);
    if (!meeting) throw new Error("meeting not found");

    const records =
      await meetingRecordRepository.findRecordsByMeetingId(meetingId);
    const actions = await actionRepository.findActionsByMeetingId(meetingId);

    return { meeting, record: records[0] || null, actions };
  }

  async getSummary(meetingId: string): Promise<MeetingRecord> {
    if (!meetingId) throw new Error("meetingId is required");

    const records =
      await meetingRecordRepository.findRecordsByMeetingId(meetingId);
    if (!records.length) throw new Error("summary not found for this meeting");

    return records[0]!;
  }
}

export default new MeetingController();
