import { Agent } from "@strands-agents/sdk";
import { meetingMinutesSchema, type MeetingMinutes } from "../utils/agent.types";
import { createMeetingModel } from "../utils/model";

const MOM_SYSTEM_PROMPT = `You convert raw meeting transcripts into accurate Minutes of Meeting.
Extract only information supported by the transcript. Do not invent owners, dates, projects,
"jira" only when the transcript asks to create or track a Jira issue, and "slack" only when
it asks to notify or message Slack. Use "none" for all other actions. Use a concise slug for
each action id. Return structured data only.`;

export const createMeetingMinutesAgent = () =>
  new Agent({
    id: "meeting-minutes-agent",
    name: "Meeting Minutes Agent",
    description:
      "Extracts a trustworthy, structured MOM from a meeting transcript.",
    model: createMeetingModel(),
    systemPrompt: MOM_SYSTEM_PROMPT,
    structuredOutputSchema: meetingMinutesSchema,
    printer: false,
  });

export class TranscriptAgent {
  async createMinutes(transcript: string): Promise<MeetingMinutes> {
    if (!transcript.trim()) {
      throw new Error("A meeting transcript is required");
    }

    console.log(`[TranscriptAgent] Starting to process transcript (${transcript.length} chars)`);

    try {
      const agent = createMeetingMinutesAgent();
      const result = await agent.invoke(
        `Create Minutes of Meeting for this transcript:\n\n${transcript.trim()}`,
      );

      console.log(`[TranscriptAgent] Agent completed with stopReason: ${result.stopReason}`);

      if (!result.structuredOutput) {
        console.error("[TranscriptAgent] No structuredOutput returned from agent");
        throw new Error("Agent did not return structured output");
      }

      const parsed = meetingMinutesSchema.safeParse(result.structuredOutput);

      if (!parsed.success) {
        console.error("[TranscriptAgent] Schema validation failed:", parsed.error.errors);
        throw new Error(
          `Meeting-minutes agent returned invalid structured output: ${JSON.stringify(parsed.error.errors)}`,
        );
      }

      console.log(`[TranscriptAgent] Successfully created minutes with ${parsed.data.actionItems.length} action items`);
      return parsed.data;
    } catch (error) {
      console.error("[TranscriptAgent] Error processing transcript:", error);
      throw error;
    }
  }
}

export default new TranscriptAgent();
