import { GoogleModel } from "@strands-agents/sdk/models/google";
import { getConfigValue } from "./config";

export const createMeetingModel = () =>
  new GoogleModel({
    apiKey: getConfigValue("GEMINI_API_KEY", process.env.GEMINI_KEY!),
    modelId: "gemini-3.5-flash",
  });
