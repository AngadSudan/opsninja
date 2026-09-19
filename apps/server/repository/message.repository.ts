import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { Message } from "../utils/type";

class MessageRepository {
  private tableName = "Messages";

  private getClient() {
    return db.getClient();
  }

  async createMessage(message: Message): Promise<Message> {
    const client = this.getClient();
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: message,
      }),
    );
    return message;
  }

  async findMessageById(messageId: string): Promise<Message | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { message_id: messageId },
      }),
    );
    return (result.Item as Message) || null;
  }

  async findMessagesByChatId(chatId: string): Promise<Message[]> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "chat_id = :chatId",
        ExpressionAttributeValues: { ":chatId": chatId },
      }),
    );
    const items = (result.Items as Message[]) || [];
    return items.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { message_id: messageId },
      }),
    );
    return true;
  }
}

export default new MessageRepository();
