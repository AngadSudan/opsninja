import { OpenRouter } from "@openrouter/sdk";
import { requireConfigValue } from "../utils/config";

interface GuardrailCheckResult {
  isInScope: boolean;
  reason?: string;
}

const SCOPE_GUIDELINES = `You are a guardrail classifier for an ops-ninja project management chatbot.
The chatbot is designed to assist with:
- Project meetings and notes
- Action items and task tracking
- Integration with Jira issues and tickets
- Slack message archival and retrieval
- Meeting transcripts and recordings
- Team collaboration and coordination

OUT OF SCOPE topics:
- General knowledge questions (history, science, trivia)
- Personal advice (career, relationships, health)
- Coding help unrelated to the ops-ninja project
- Financial or legal advice
- Entertainment (games, jokes, storytelling)
- Weather, sports, news
- Any topics not related to project management or ops-ninja

Respond with ONLY a JSON object in this exact format:
{"isInScope": true/false, "reason": "brief explanation"}`;

class GuardrailService {
  private client?: OpenRouter;

  private getClient() {
    this.client ??= new OpenRouter({
      apiKey: requireConfigValue("OPENROUTER_API_KEY"),
    });
    return this.client;
  }

  async checkMessage(userMessage: string): Promise<GuardrailCheckResult> {
    try {
      console.log(`[GuardrailService] Checking message scope: "${userMessage.substring(0, 50)}..."`);

      const response = await this.getClient().chat.send({
        chatRequest: {
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Classify if this message is in scope for the ops-ninja project management chatbot:\n\n"${userMessage}"`,
            },
          ],
          system_prompt: SCOPE_GUIDELINES,
          max_tokens: 256,
          stream: false,
        },
      });

      const responseText = response.choices?.[0]?.message?.content;
      if (!responseText || typeof responseText !== "string") {
        console.warn("[GuardrailService] Invalid response format");
        return { isInScope: true, reason: "Unable to verify scope" };
      }

      const result = JSON.parse(responseText);
      console.log(`[GuardrailService] Classification result:`, result);
      return result as GuardrailCheckResult;
    } catch (error) {
      console.error("[GuardrailService] Error checking message scope:", error);
      return { isInScope: true, reason: "Guardrail check failed - allowing message" };
    }
  }

  getOutOfScopeResponse(): string {
    return `I'm designed to assist with project management, meetings, and action items related to the ops-ninja project. Your question appears to be outside my scope. Please ask about:\n- Project meetings and notes\n- Action items and task tracking\n- Jira issues and tickets\n- Slack messages\n- Meeting transcripts\n- Team coordination\n\nHow can I help you with your project?`;
  }
}

export default new GuardrailService();
