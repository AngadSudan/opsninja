import { OpenRouter } from "@openrouter/sdk";
import YAML from "yaml";
import { requireConfigValue } from "../utils/config";
import {
  meetingActionSchema,
  meetingMinutesSchema,
} from "../utils/agent.types";
import type { MeetingAction, MeetingMinutes } from "../utils/agent.types";

export type StructuredMOM = {
  shortname: string;
  description: string;
  actions: MeetingAction[];
  minutes: MeetingMinutes;
};

class TranscriptProcessorService {
  private client?: OpenRouter;

  private getClient() {
    this.client ??= new OpenRouter({
      apiKey: requireConfigValue("OPENROUTER_API_KEY"),
    });
    return this.client;
  }

  async processTranscript(transcript: string): Promise<StructuredMOM> {
    if (!transcript?.trim()) {
      throw new Error("Transcript is required");
    }

    console.log(
      `[TranscriptProcessor] Processing transcript (${transcript.length} chars)`,
    );

    const prompt = `Extract a structured Minutes of Meeting from this transcript. Return YAML ONLY with exactly these three top-level fields:
meetingrecord:
  shortname: string - concise title to display at the top of the MOM
  participants: array of participant names
  decisions: array of key decisions made
  objective: string or null
  risksAndDependencies: array of risks or dependencies
meetingaction:
  - id: unique short slug
  - title: action title
  - description: detailed action description
  - assignee: person responsible or null
  - dueDate: due date as stated or null
  - target: Jira project key or Slack channel or null
  - externalAction: jira, slack, or none
  - priority: low, medium, high, or urgent
description: |-
  The complete, accurate Minutes of Meeting in readable Markdown. Follow this order when supported by the transcript: Objective, Discussion Summary, Confirmed Deadlines, Decisions Made, Risks and Dependencies, Action Items, Next Follow-Up Meeting, Closing Notes. Use headings and concise bullet lists or tables where useful. The description must be self-contained and suitable to display as the MOM. Every line after description: |- must be indented by two spaces.

Do not invent information. Use empty arrays and null values when the transcript does not provide a value.

TRANSCRIPT:
${transcript}

Return ONLY valid YAML, no markdown fences or other text.`;

    try {
      console.log(`[TranscriptProcessor] Calling AI to extract MOM...`);
      const resultOrError = await this.getClient().chat.send({
        chatRequest: {
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          maxTokens: 4096,
          stream: false,
        },
      });

      if (!resultOrError.ok) {
        console.error("[TranscriptProcessor] AI API error:", resultOrError.error);
        throw new Error(`AI API error: ${String(resultOrError.error)}`);
      }

      const content = resultOrError.value?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content in AI response");
      }

      console.log(
        `[TranscriptProcessor] Received AI response (${content.length} chars)`,
      );

      const yamlContent = content
        .replace(/^```(?:yaml)?\s*/i, "")
        .replace(/\s*```\s*$/i, "");
      let parsed: {
        meetingrecord?: Record<string, unknown>;
        meetingaction?: unknown;
        description?: unknown;
      };
      try {
        parsed = YAML.parse(yamlContent) as typeof parsed;
      } catch (yamlError) {
        // Some models still emit Markdown directly after `description:` instead
        // of a YAML block scalar. Parse the valid metadata before it and retain
        // the remainder verbatim as the MOM rather than rejecting the upload.
        const descriptionStart = yamlContent.match(/^description:\s*/m);
        if (descriptionStart?.index === undefined) throw yamlError;

        const metadata = yamlContent.slice(0, descriptionStart.index);
        const description = yamlContent
          .slice(descriptionStart.index + descriptionStart[0].length)
          .replace(/^\|-?\s*\r?\n?/, "")
          .replace(/^ {2}/gm, "")
          .trim();
        if (!description) throw yamlError;

        parsed = {
          ...(YAML.parse(metadata) as Omit<typeof parsed, "description">),
          description,
        };
        console.warn(
          "[TranscriptProcessor] Recovered MOM from a non-block YAML description",
        );
      }
      const asRecord = (value: unknown): Record<string, unknown> | undefined =>
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : undefined;
      const record =
        asRecord(parsed.meetingrecord) ??
        asRecord((parsed as Record<string, unknown>).meetingRecord) ??
        asRecord((parsed as Record<string, unknown>).meeting_details) ??
        {};
      const rawDescriptionStart = yamlContent.match(/^description:\s*/m);
      const rawDescription =
        rawDescriptionStart?.index === undefined
          ? ""
          : yamlContent
              .slice(
                rawDescriptionStart.index + rawDescriptionStart[0].length,
              )
              .replace(/^\|-?\s*\r?\n?/, "")
              .replace(/^ {2}/gm, "")
              .trim();
      const responseHeading = content.match(/^#{1,2}\s+(.+)$/m)?.[1]?.trim();
      const shortname =
        [record.shortname, record.title, (parsed as Record<string, unknown>).shortname, (parsed as Record<string, unknown>).title]
          .find((value): value is string => typeof value === "string" && value.trim().length > 0)
          ?.trim() ??
        responseHeading ??
        "Meeting Minutes";
      const description =
        (typeof parsed.description === "string" && parsed.description.trim()) ||
        rawDescription ||
        content.trim();
      const possibleActionItems = (parsed as Record<string, unknown>).actionItems;
      const rawActions: unknown[] = Array.isArray(parsed.meetingaction)
        ? parsed.meetingaction
        : Array.isArray(possibleActionItems)
          ? possibleActionItems
          : [];
      const actions = rawActions.flatMap((action) => {
        const result = meetingActionSchema.safeParse(action);
        return result.success ? [result.data] : [];
      });
      const minutes = meetingMinutesSchema.parse({
        title: shortname,
        participants: Array.isArray(record.participants)
          ? record.participants
          : [],
        objective:
          typeof record.objective === "string" ? record.objective : undefined,
        summary: description,
        decisions: Array.isArray(record.decisions) ? record.decisions : [],
        risksAndDependencies: Array.isArray(record.risksAndDependencies)
          ? record.risksAndDependencies
          : [],
        actionItems: actions,
      });

      console.log(
        `[TranscriptProcessor] Successfully extracted MOM: ${actions.length} action items, ${minutes.decisions.length} decisions`,
      );

      return {
        shortname,
        description,
        actions,
        minutes,
      };
    } catch (error) {
      console.error(
        `[TranscriptProcessor] Error processing transcript:`,
        error,
      );
      throw error;
    }
  }
}

export default new TranscriptProcessorService();
