import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { Chat } from "../utils/type";

class ChatRepository {
  private tableName = "Chats";

  private getClient() {
    return db.getClient();
  }

  async createChat(chat: Chat): Promise<Chat> {
    const client = this.getClient();
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: chat,
      }),
    );
    return chat;
  }

  async findChatById(chatId: string): Promise<Chat | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { chat_id: chatId },
      }),
    );
    return (result.Item as Chat) || null;
  }

  async findChatsByProjectId(projectId: string): Promise<Chat[]> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "project_id = :projectId",
        ExpressionAttributeValues: { ":projectId": projectId },
      }),
    );
    return (result.Items as Chat[]) || [];
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat | null> {
    const client = this.getClient();
    const entries = Object.entries(updates).filter(
      ([key, v]) =>
        v !== undefined &&
        key !== "chat_id" &&
        key !== "project_id" &&
        key !== "created_by" &&
        key !== "created_at" &&
        key !== "updated_at",
    );

    if (entries.length === 0) {
      return await this.findChatById(chatId);
    }

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of entries) {
      const attrName = `#${key}`;
      const attrVal = `:${key}`;
      updateExpressions.push(`${attrName} = ${attrVal}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrVal] = value;
    }

    updateExpressions.push("#updated_at = :updated_at");
    expressionAttributeNames["#updated_at"] = "updated_at";
    expressionAttributeValues[":updated_at"] = new Date().toISOString();

    const result = await client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { chat_id: chatId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return (result.Attributes as Chat) || null;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { chat_id: chatId },
      }),
    );
    return true;
  }
}

export default new ChatRepository();
