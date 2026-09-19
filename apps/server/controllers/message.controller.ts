import crypto from "crypto";
import messageRepository from "../repository/message.repository";
import chatRepository from "../repository/chat.repository";
import meetingRepository from "../repository/meeting.repository";
import meetingRecordRepository from "../repository/meetingRecord.repository";
import projectRepository from "../repository/project.repository";
import conversationService from "../service/conversation.service";
import embeddingService from "../service/embedding.service";
import graphService from "../service/graph.service";
import type { Message } from "../utils/type";
import type { JiraCredentials } from "../agent/jira.agent";
import type { SlackCredentials } from "../agent/slack.agent";

class MessageController {
  async sendMessage(
    projectId: string,
    chatId: string,
    text: string,
    jiraCredentials?: JiraCredentials,
    slackCredentials?: SlackCredentials,
  ): Promise<{ user_message: Message; agent_reply: Message; proposed_actions: unknown[] }> {
    if (!chatId) throw new Error("chatId is required");
    if (!text?.trim()) throw new Error("message is required");

    const chat = await chatRepository.findChatById(chatId);
    if (!chat) throw new Error("chat not found");
    if (chat.project_id !== projectId) throw new Error("chat does not belong to this project");

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

    const systemPrompt = await this.buildProjectSystemPrompt(projectId, text.trim());

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

  private async buildProjectSystemPrompt(projectId: string, question: string): Promise<string> {
    const project = await projectRepository.findProjectById(projectId);
    const [meetings, graphContext] = await Promise.all([
      meetingRepository.findMeetingsByProjectId(projectId),
      embeddingService
        .embed(question)
        .then((embedding) => embedding.length ? graphService.getProjectContext(projectId, embedding) : null)
        .catch(() => null),
    ]);
    const records = await Promise.all(
      meetings.slice(-10).map(async (meeting) => ({
        meeting,
        record: (await meetingRecordRepository.findRecordsByMeetingId(meeting.meeting_id))[0],
      })),
    );
    const storedMinutes = records
      .filter((item) => item.record)
      .map(({ meeting, record }) =>
        `Meeting: ${record!.shortname} (${meeting.created_at})\nMOM: ${record!.description}\nActions: ${record!.actions.map((a) => `${a.title}${a.assignee ? ` — ${a.assignee}` : ""}${a.dueDate ? `, due ${a.dueDate}` : ""}`).join("; ") || "None"}`,
      )
      .join("\n\n")
      .slice(0, 18000);
    const graphMinutes = graphContext
      ? `Graph retrieval:\n${graphContext.meetings.map((m) => `${m.summary}\nDecisions: ${m.decisions.join("; ")}`).join("\n\n")}\nRecent actions: ${graphContext.recentActions.map((a) => `${a.title} (${a.status})`).join("; ")}`
      : "";

    return `You are Ops Ninja, a project meeting assistant. Answer using only the project context below. If the answer is not in the records, say that clearly; do not invent facts, owners, dates, or decisions. Be concise and directly answer the question.\n\nProject: ${project?.name ?? projectId}\n\n${graphMinutes}\n\nStored minutes:\n${storedMinutes || "No processed meeting minutes are available yet."}`;
  }

  async getAllMessages(chatId: string): Promise<Message[]> {
    if (!chatId) throw new Error("chatId is required");
    return await messageRepository.findMessagesByChatId(chatId);
  }
}

export default new MessageController();

