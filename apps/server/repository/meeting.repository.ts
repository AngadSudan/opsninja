import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { Meeting } from "../utils/type";

class MeetingRepository {
  private tableName = "Meetings";

  private getClient() {
    return db.getClient();
  }

  async createMeeting(meeting: Meeting): Promise<Meeting> {
    const client = this.getClient();
    const cleanMeeting = Object.fromEntries(
      Object.entries(meeting).filter(([, v]) => v !== undefined)
    );
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: cleanMeeting,
      }),
    );
    return meeting;
  }

  async findMeetingById(meetingId: string): Promise<Meeting | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { meeting_id: meetingId },
      }),
    );
    return (result.Item as Meeting) || null;
  }

  async findMeetingsByProjectId(projectId: string): Promise<Meeting[]> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "project_id = :projectId",
        ExpressionAttributeValues: { ":projectId": projectId },
      }),
    );
    return (result.Items as Meeting[]) || [];
  }

  async deleteMeeting(meetingId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { meeting_id: meetingId },
      }),
    );
    return true;
  }
}

export default new MeetingRepository();
