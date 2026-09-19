import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { User, UpdateUserDTO } from "../utils/type";

class UserRepository {
  private tableName = "Users";

  private getClient() {
    return db.getClient();
  }

  async createUser(user: User): Promise<User> {
    const client = this.getClient();
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
      }),
    );
    return user;
  }

  async findUserById(userId: string): Promise<User | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { user_id: userId },
      }),
    );
    return (result.Item as User) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "user_email = :email",
        ExpressionAttributeValues: { ":email": email },
      }),
    );
    return (result.Items?.[0] as User) || null;
  }

  async updateUser(userId: string, updates: UpdateUserDTO): Promise<User | null> {
    const client = this.getClient();
    const entries = Object.entries(updates).filter(
      ([key, v]) =>
        v !== undefined &&
        key !== "user_id" &&
        key !== "user_email" &&
        key !== "created_at" &&
        key !== "updated_at",
    );

    if (entries.length === 0) {
      return await this.findUserById(userId);
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
        Key: { user_id: userId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return (result.Attributes as User) || null;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { user_id: userId },
      }),
    );
    return true;
  }
}

export default new UserRepository();
