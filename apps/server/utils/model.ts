import { OpenAIModel } from "@strands-agents/sdk/models/openai";
import { requireConfigValue } from "./config";

export const createMeetingModel = () =>
  new OpenAIModel({
    apiKey: requireConfigValue("OPENROUTER_API_KEY"),
    baseURL: "https://openrouter.ai/api/v1",
    modelId: "openai/gpt-4o-mini",
  });
