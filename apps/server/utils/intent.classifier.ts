import { OpenRouter } from "@openrouter/sdk";
import { requireConfigValue } from "./config";

export type Intent = "LOOKUP" | "ACTION_REQUEST" | "CONVERSATION" | "AMBIGUOUS";

const VALID_INTENTS: Intent[] = [
  "LOOKUP",
  "ACTION_REQUEST",
  "CONVERSATION",
  "AMBIGUOUS",
];

export async function classifyIntent(text: string): Promise<Intent> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const client = new OpenRouter({ apiKey: requireConfigValue("OPENROUTER_API_KEY") });
    const response = await client.messages.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Classify the user message into exactly one of: LOOKUP, ACTION_REQUEST, CONVERSATION, AMBIGUOUS.\n\nLOOKUP — user wants information from past meetings/decisions/actions.\nACTION_REQUEST — user wants to create a Jira issue, send a Slack message, or trigger an external action.\nCONVERSATION — general chat, greetings, or unrelated discussion.\nAMBIGUOUS — cannot determine intent clearly.\n\nRespond with only the label, nothing else.\n\nMessage: ${text}`,
        },
      ],
    });

    const label = response.choices?.[0]?.message?.content?.trim().toUpperCase() as Intent;
    if (VALID_INTENTS.includes(label)) {
      console.log(`[IntentClassifier] Classified as: ${label}`);
      return label;
    }
    console.warn(`[IntentClassifier] Invalid intent label returned: ${label}`);
    return "AMBIGUOUS";
  } catch (error) {
    console.error("[IntentClassifier] Error classifying intent:", error);
    return "AMBIGUOUS";
  } finally {
    clearTimeout(timer);
  }
}
