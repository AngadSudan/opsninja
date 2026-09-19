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

    console.log(
      `[MeetingController] Processing transcript for meeting ${meeting.meeting_id} (${dto.original_transcript.length} chars)`,
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
        `[MeetingController] Failed to ingest transcript for meeting ${meeting.meeting_id}:`,
        error,
      );
      throw error;
    }

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

    await meetingRecordRepository.createRecord(record);

    console.log(`[MeetingController] Saving transcript to Neptune graph...`);
    try {
      await graphService.indexMeeting({
        projectId,
        meetingId: meeting.meeting_id,
        recordId: record.record_id,
        minutes: workflowResult.minutes,
        summaryEmbedding: [],
      });
      console.log(`[MeetingController] Transcript indexed in Neptune`);
    } catch (error) {
      console.warn(
        `[MeetingController] Failed to save to Neptune, continuing:`,
        error,
      );
    }

    for (const proposal of workflowResult.proposals) {
      const actionNow = new Date().toISOString();
      const action: MeetingActionItem = {
        action_id: crypto.randomUUID(),
        meeting_id: meeting.meeting_id,
        action_by: dto.uploaded_by,
        action_status: "pending",
        action_type:
          proposal.type === "jira" ? "create_jira_issue" : "send_slack_message",
        integration_platform: proposal.type,
        created_at: actionNow,
        updated_at: actionNow,
      };
      await actionRepository.createAction(action);
    }

    return {
      ...meeting,
      shortname: workflowResult.shortname,
      description: workflowResult.description,
      actions: workflowResult.actions,
      proposals: workflowResult.proposals,
    };
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
