export const LIMITS_BY_INTENT = {
  LOOKUP: { maxTurns: 5, maxTokens: 8_000 },
  ACTION_REQUEST: { maxTurns: 8, maxTokens: 12_000 },
  CONVERSATION: { maxTurns: 3, maxTokens: 4_000 },
  AMBIGUOUS: { maxTurns: 8, maxTokens: 16_000 },
} as const;

export function trimToolResponse(text: string, maxChars = 2000): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.8 ? truncated.slice(0, lastSpace) : truncated) + " […truncated]";
}
