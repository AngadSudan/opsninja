import { GoogleModel } from '@strands-agents/sdk/models/google'

export const createMeetingModel = () =>
  new GoogleModel({
    apiKey: process.env.GEMINI_KEY,
    modelId: 'gemini-3.5-flash'
  });
