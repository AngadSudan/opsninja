import { ExecuteOpenCypherQueryCommand } from "@aws-sdk/client-neptunedata";
import NeptuneClient from "@opsninja/graph-db";
import { requireConfigValue } from "./config";

let client: ReturnType<typeof NeptuneClient.getInstance> | null = null;

const getClient = () => {
  if (!client) {
    const rawEndpoint = requireConfigValue("AWS_NEPTUNE_ENDPOINT");
    // The Neptune Data SDK requires a full URL — add https:// if absent.
    const endpoint = rawEndpoint.startsWith("http")
      ? rawEndpoint
      : `https://${rawEndpoint}`;
    console.log(`[Neptune] Initializing client with endpoint: ${endpoint}`);
    client = NeptuneClient.getInstance(endpoint);
  }
  return client;
};

export const runQuery = async <T = Record<string, unknown>>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T[]> => {
  const neptune = getClient();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const result = await neptune.executeCommand(
      new ExecuteOpenCypherQueryCommand({
        openCypherQuery: query,
        parameters: JSON.stringify(params),
      }),
      { abortSignal: controller.signal },
    );

    // result.results is a DOCUMENT_VALUE from Neptune.
    // For openCypher, Neptune returns rows as a plain JS array.
    // Some SDK/proxy versions nest it under { results: [...] }.
    const raw = result?.results as unknown;
    if (Array.isArray(raw)) {
      return raw as T[];
    }
    if (raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).results)) {
      return (raw as Record<string, unknown[]>).results as T[];
    }
    return [];
  } catch (err) {
    console.error("[Neptune] runQuery error:", err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};
