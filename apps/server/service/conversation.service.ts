import { OpenRouter } from "@openrouter/sdk";
import { requireConfigValue } from "../utils/config";

class ConversationService {
  private client?: OpenRouter;

  private getClient() {
    this.client ??= new OpenRouter({
      apiKey: requireConfigValue("OPENROUTER_API_KEY"),
    });
    return this.client;
  }

  async chat(
    userMessage: string,
    systemPrompt: string,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  ): Promise<string> {
    try {
      const messages = [
        ...(conversationHistory || []),
        {
          role: "user" as const,
          content: userMessage,
        },
      ];

      console.log(`[ConversationService] Sending chat request with ${messages.length} messages`);

      const response = await this.getClient().chat.send({
        chatRequest: {
          model: "openai/gpt-4o-mini",
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          system_prompt: systemPrompt,
          max_tokens: 2048,
          stream: false,
        },
      });

      const answer = response.choices?.[0]?.message?.content;
      if (!answer) {
        console.warn("[ConversationService] No content in response");
        return "I couldn't generate a response. Please try again.";
      }

      if (typeof answer !== "string") {
        console.error("[ConversationService] Response content is not a string:", answer);
        return "I encountered an error processing your request.";
      }

      console.log(`[ConversationService] Successfully generated response (${answer.length} chars)`);
      return answer;
    } catch (error) {
      console.error("[ConversationService] Error in chat:", error);
      throw error;
    }
  }
}

export default new ConversationService();

