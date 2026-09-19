import crypto from "crypto";
import chatRepository from "../repository/chat.repository";
import projectRepository from "../repository/project.repository";
import type { Chat, CreateChatDTO } from "../utils/type";

class ChatController {
  async createChat(projectId: string, details: Omit<CreateChatDTO, "project_id">): Promise<Chat> {
    if (!projectId) throw new Error("projectId is required");
    if (!details.created_by) throw new Error("created_by is required");

    const project = await projectRepository.findProjectById(projectId);
    if (!project) throw new Error("project not found");

    const now = new Date().toISOString();
    const chat: Chat = {
      chat_id: crypto.randomUUID(),
      project_id: projectId,
      chat_name: details.chat_name?.trim() || "New Chat",
      created_by: details.created_by,
      created_at: now,
      updated_at: now,
    };

    return await chatRepository.createChat(chat);
  }

  async getAllChats(projectId: string): Promise<Chat[]> {
    if (!projectId) throw new Error("projectId is required");
    return await chatRepository.findChatsByProjectId(projectId);
  }

  async getChat(chatId: string): Promise<Chat> {
    if (!chatId) throw new Error("chatId is required");

    const chat = await chatRepository.findChatById(chatId);
    if (!chat) throw new Error("chat not found");

    return chat;
  }

  async deleteChat(chatId: string): Promise<{ success: boolean; chat_id: string }> {
    if (!chatId) throw new Error("chatId is required");

    const existing = await chatRepository.findChatById(chatId);
    if (!existing) throw new Error("chat not found");

    await chatRepository.deleteChat(chatId);
    return { success: true, chat_id: chatId };
  }
}

export default new ChatController();
