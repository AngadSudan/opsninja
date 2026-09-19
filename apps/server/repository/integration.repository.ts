import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { Integration } from "../utils/type";

class IntegrationRepository {
  private tableName = "Integrations";

  private getClient() {
    return db.getClient();
  }

  async createIntegration(integration: Integration): Promise<Integration> {
    const client = this.getClient();
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: integration,
      }),
    );
    return integration;
  }

  async findIntegrationById(integrationId: string): Promise<Integration | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { integration_id: integrationId },
      }),
    );
    return (result.Item as Integration) || null;
  }

  async findIntegrationsByUserId(userId: string): Promise<Integration[]> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "user_id = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      }),
    );
    return (result.Items as Integration[]) || [];
  }

  async updateIntegration(
    integrationId: string,
    updates: Partial<Integration>,
  ): Promise<Integration | null> {
    const client = this.getClient();
    const entries = Object.entries(updates).filter(
      ([key, v]) =>
        v !== undefined &&
        key !== "integration_id" &&
        key !== "user_id" &&
        key !== "created_at" &&
        key !== "updated_at",
    );

    if (entries.length === 0) {
      return await this.findIntegrationById(integrationId);
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
        Key: { integration_id: integrationId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return (result.Attributes as Integration) || null;
  }

  async deleteIntegration(integrationId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { integration_id: integrationId },
      }),
    );
    return true;
  }
}

export default new IntegrationRepository();
