import { ExecuteOpenCypherQueryCommand } from "@aws-sdk/client-neptunedata";
import NeptuneClient from "@opsninja/graph-db";
import { requireConfigValue } from "./config";

let client: ReturnType<typeof NeptuneClient.getInstance> | null = null;

const getClient = () => {
  if (!client) {
    client = NeptuneClient.getInstance(requireConfigValue("AWS_NEPTUNE_ENDPOINT"));
  }
  return client;
};

export const runQuery = async <T = Record<string, unknown>>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T[]> => {
  const neptune = getClient();
  const result = await neptune.executeCommand(
    new ExecuteOpenCypherQueryCommand({
      openCypherQuery: query,
      parameters: JSON.stringify(params),
    }),
  );
  const rows = (result?.results as T[]) ?? [];
  return rows;
};
