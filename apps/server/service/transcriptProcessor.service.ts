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
    title: action title
    description: detailed action description
    assignee: person responsible or null
    dueDate: due date as stated or null
    target: Jira project key or Slack channel or null
    externalAction: jira, slack, or none
    priority: low, medium, high, or urgent
description: string - the complete, accurate Minutes of Meeting in readable prose

Do not invent information. Use empty arrays and null values when the transcript does not provide a value.

TRANSCRIPT:
${transcript}

Return ONLY valid YAML, no markdown fences or other text.`;

    try {
      console.log(`[TranscriptProcessor] Calling AI to extract MOM...`);
      const response = await this.getClient().chat.send({
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

      const content = (
        response as unknown as {
          choices?: Array<{ message?: { content?: string } }>;
        }
      ).choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content in AI response");
      }

      console.log(
        `[TranscriptProcessor] Received AI response (${content.length} chars)`,
      );

      const yamlContent = content
        .replace(/^```(?:yaml)?\s*/i, "")
        .replace(/\s*```\s*$/i, "");
      const parsed = YAML.parse(yamlContent) as {
        meetingrecord?: Record<string, unknown>;
        meetingaction?: unknown;
        description?: unknown;
      };
      const record = parsed.meetingrecord;
      const actions = Array.isArray(parsed.meetingaction)
        ? parsed.meetingaction.map((action) =>
            meetingActionSchema.parse(action),
          )
        : [];
      if (
        !record ||
        typeof record.shortname !== "string" ||
        typeof parsed.description !== "string"
      ) {
        throw new Error(
          "Invalid MOM YAML: meetingrecord.shortname and description are required",
        );
      }
      const minutes = meetingMinutesSchema.parse({
        title: record.shortname,
        participants: Array.isArray(record.participants)
          ? record.participants
          : [],
        objective:
          typeof record.objective === "string" ? record.objective : undefined,
        summary: parsed.description,
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
        shortname: record.shortname,
        description: parsed.description,
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
