import { OpenRouter } from "@openrouter/sdk";
import { requireConfigValue } from "../utils/config";

class EmbeddingService {
  private client?: OpenRouter;

  private getClient() {
    this.client ??= new OpenRouter({
      apiKey: requireConfigValue("OPENROUTER_API_KEY"),
    });
    return this.client;
  }

  async embed(text: string): Promise<number[]> {
    try {
      const resultOrError = await this.getClient().embeddings.generate({
        requestBody: {
          model: "openai/text-embedding-3-small",
          input: text,
        },
      });

      // The OpenRouter SDK returns a Result<T, E> discriminated union.
      if (!resultOrError.ok) {
        console.error("[EmbeddingService] API error:", resultOrError.error);
        throw new Error(`Embedding API error: ${String(resultOrError.error)}`);
      }

      const embedding = resultOrError.value?.data?.[0]?.embedding;
      if (!embedding) {
        console.warn("[EmbeddingService] No embedding returned from API");
        return [];
      }
      if (typeof embedding === "string") {
        console.warn("[EmbeddingService] Embedding returned as string, expected array");
        return [];
      }
      return embedding;
    } catch (error) {
      console.error("[EmbeddingService] Error generating embedding:", error);
      throw error;
    }
  }
}

export default new EmbeddingService();
