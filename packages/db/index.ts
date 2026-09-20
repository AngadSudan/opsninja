import {
  CreateTableCommand,
  DynamoDBClient,
  type ServiceInputTypes,
  type ServiceOutputTypes,
} from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Command } from "@smithy/types";

class DynamoDB {
  private static instance: DynamoDB | null = null;
  private client: DynamoDBDocumentClient;

  private constructor(region: string, accessKey: string, accessSecret: string) {
    const client = new DynamoDBClient({
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: accessSecret },
    });
    // MOM action items legitimately omit optional fields such as assignee and
    // due date. DynamoDB cannot marshal `undefined` values nested in arrays,
    // so remove them consistently for every repository write.
    this.client = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  public static getInstance(
    region: string,
    accessKey: string,
    accessSecret: string,
  ): DynamoDB {
    if (!DynamoDB.instance) {
      DynamoDB.instance = new DynamoDB(region, accessKey, accessSecret);
    }
    return DynamoDB.instance;
  }

  public getClient(): DynamoDBDocumentClient {
    return this.client;
  }

  public async executeCommand(
    command: Command<ServiceInputTypes, any, ServiceOutputTypes, any, any>,
  ): Promise<ServiceOutputTypes> {
    return this.client.send(command);
  }

  public async createTable(
    tableName: string,
    tableConfig: { attributeName: string; keyType: "HASH" | "RANGE" }[],
    billingMode: "PROVISIONED" | "PAY_PER_REQUEST",
  ) {
    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: tableConfig.map(({ attributeName, keyType }) => ({
        AttributeName: attributeName,
        KeyType: keyType,
      })),
      AttributeDefinitions: tableConfig.map(({ attributeName }) => ({
        AttributeName: attributeName,
        AttributeType: "S",
      })),
      BillingMode: billingMode,
      ...(billingMode === "PROVISIONED"
        ? {
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          }
        : {}),
    });

    try {
      return await this.client.send(command);
    } catch (error: any) {
      if (error.name === "ResourceInUseException") {
        // @ts-ignore
        console.log("resource already exist");
        return;
      }
      throw error;
    }
  }
}
export default DynamoDB;
