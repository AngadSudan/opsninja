import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { MeetingActionItem, UpdateActionDTO } from "../utils/type";

class ActionRepository {
  private tableName = "Actions";

  private getClient() {
    return db.getClient();
  }

  async createAction(action: MeetingActionItem): Promise<MeetingActionItem> {
    const client = this.getClient();
    const cleanAction = Object.fromEntries(
      Object.entries(action).filter(([, v]) => v !== undefined)
    );
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: cleanAction,
      }),
    );
    return action;
  }

  async findActionById(actionId: string): Promise<MeetingActionItem | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { action_id: actionId },
      }),
    );
    return (result.Item as MeetingActionItem) || null;
  }

  async findActionsByMeetingId(meetingId: string): Promise<MeetingActionItem[]> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "meeting_id = :meetingId",
        ExpressionAttributeValues: { ":meetingId": meetingId },
      }),
    );
    return (result.Items as MeetingActionItem[]) || [];
  }

  async updateAction(
    actionId: string,
    updates: UpdateActionDTO & { action_by?: string },
  ): Promise<MeetingActionItem | null> {
    const client = this.getClient();
    const entries = Object.entries(updates).filter(
      ([key, v]) =>
        v !== undefined &&
        key !== "action_id" &&
        key !== "meeting_id" &&
        key !== "created_at" &&
        key !== "updated_at",
    );

    if (entries.length === 0) {
      return await this.findActionById(actionId);
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
        Key: { action_id: actionId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return (result.Attributes as MeetingActionItem) || null;
  }

  async deleteAction(actionId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { action_id: actionId },
      }),
    );
    return true;
  }
}

export default new ActionRepository();
