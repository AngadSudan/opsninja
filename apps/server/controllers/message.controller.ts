import crypto from "crypto";
import messageRepository from "../repository/message.repository";
import chatRepository from "../repository/chat.repository";
import conversationService from "../service/conversation.service";
import type { Message } from "../utils/type";
import type { JiraCredentials } from "../agent/jira.agent";
import type { SlackCredentials } from "../agent/slack.agent";

class MessageController {
  async sendMessage(
    chatId: string,
    text: string,
    jiraCredentials?: JiraCredentials,
    slackCredentials?: SlackCredentials,
  ): Promise<{ user_message: Message; agent_reply: Message; proposed_actions: unknown[] }> {
    if (!chatId) throw new Error("chatId is required");
    if (!text?.trim()) throw new Error("message is required");

    const chat = await chatRepository.findChatById(chatId);
    if (!chat) throw new Error("chat not found");

    const now = new Date().toISOString();
    const userMessage: Message = {
      message_id: crypto.randomUUID(),
      chat_id: chatId,
      message: text.trim(),
      message_type: "USER",
      created_at: now,
      updated_at: now,
    };

    await messageRepository.createMessage(userMessage);

    console.log(`[MessageController] Processing message: "${text.substring(0, 50)}..."`);

    // Get previous messages for context
    const allMessages = await messageRepository.findMessagesByChatId(chatId);
    const conversationHistory = allMessages
      .filter((m) => m.message_id !== userMessage.message_id)
      .slice(-5)
      .map((m) => ({
        role: m.message_type === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.message,
      }));

    const systemPrompt = "You are a helpful assistant for project meetings and action items. Provide clear, concise answers.";

    let answer: string;
    try {
      console.log(`[MessageController] Calling AI conversation service...`);
      answer = await conversationService.chat(
        text.trim(),
        systemPrompt,
        conversationHistory,
      );
      console.log(`[MessageController] AI response received: ${answer.substring(0, 100)}...`);
    } catch (error) {
      console.error(`[MessageController] AI service error:`, error);
      answer = `I encountered an error: ${error instanceof Error ? error.message : String(error)}`;
    }

    const replyNow = new Date().toISOString();
    const agentReply: Message = {
      message_id: crypto.randomUUID(),
      chat_id: chatId,
      message: answer,
      message_type: "SYSTEM",
      created_at: replyNow,
      updated_at: replyNow,
    };

    await messageRepository.createMessage(agentReply);
    console.log(`[MessageController] Message saved successfully`);

    return { user_message: userMessage, agent_reply: agentReply, proposed_actions: [] };
  }

  async getAllMessages(chatId: string): Promise<Message[]> {
    if (!chatId) throw new Error("chatId is required");
    return await messageRepository.findMessagesByChatId(chatId);
  }
}

export default new MessageController();

