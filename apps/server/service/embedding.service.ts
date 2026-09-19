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
      const response = await this.getClient().embeddings.generate({
        requestBody: {
          model: "openai/text-embedding-3-small",
          input: text,
        },
      });
      const embedding = response.data?.[0]?.embedding;
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
