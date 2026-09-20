import { Agent, Message, TextBlock } from "@strands-agents/sdk";
import { createMeetingModel } from "../utils/model";

class ConversationService {
  async chat(
    userMessage: string,
    systemPrompt: string,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  ): Promise<string> {
    try {
      console.log(
        `[ConversationService] Sending chat request with ${conversationHistory?.length ?? 0} history turns`,
      );

      const agent = new Agent({
        id: `conversation-${Date.now()}`,
        name: "Meeting Assistant",
        model: createMeetingModel(),
        systemPrompt:
          systemPrompt ||
          "You are a helpful assistant for meeting minutes, projects, and team operations.",
        printer: false,
      });

      if (conversationHistory?.length) {
        for (const turn of conversationHistory) {
          if (!turn.content?.trim()) continue;
          agent.messages.push(
            new Message({
              role: turn.role,
              content: [new TextBlock(turn.content)],
            }),
          );
        }
      }

      const result = await agent.invoke(userMessage);

      const lastMsg = result.lastMessage ?? agent.messages.at(-1);
      const answer =
        lastMsg?.content
          ?.map((block: any) =>
            typeof block?.text === "string" ? block.text : "",
          )
          .join("")
          .trim() || "";

      if (!answer) {
        console.warn("[ConversationService] No content in response:", result);
        return "I couldn't generate a response. Please try again.";
      }

      console.log(
        `[ConversationService] Successfully generated response (${answer.length} chars)`,
      );
      return answer;
    } catch (error) {
      console.error("[ConversationService] Error in chat:", error);
      throw error;
    }
  }
}

export default new ConversationService();
