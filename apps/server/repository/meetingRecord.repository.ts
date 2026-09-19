import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import db from "../utils/db";
import type { MeetingRecord } from "../utils/type";

class MeetingRecordRepository {
  private tableName = "MeetingRecords";

  private getClient() {
    return db.getClient();
  }

  async createRecord(record: MeetingRecord): Promise<MeetingRecord> {
    const client = this.getClient();
    const cleanRecord = Object.fromEntries(
      Object.entries(record).filter(([, v]) => v !== undefined)
    );
    await client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: cleanRecord,
      }),
    );
    return record;
  }

  async findRecordById(recordId: string): Promise<MeetingRecord | null> {
    const client = this.getClient();
    const result = await client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { record_id: recordId },
      }),
    );
    return (result.Item as MeetingRecord) || null;
  }

  async findRecordsByMeetingId(meetingId: string): Promise<MeetingRecord[]> {
    const client = this.getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "meeting_id = :meetingId",
        ExpressionAttributeValues: { ":meetingId": meetingId },
      }),
    );
    return (result.Items as MeetingRecord[]) || [];
  }

  async deleteRecord(recordId: string): Promise<boolean> {
    const client = this.getClient();
    await client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { record_id: recordId },
      }),
    );
    return true;
  }
}

export default new MeetingRecordRepository();
