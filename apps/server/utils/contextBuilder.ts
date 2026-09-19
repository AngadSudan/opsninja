export function buildSystemPrefix(
  projectId: string,
  projectName: string,
  meetingSummaries: string[],
): string {
  if (!meetingSummaries.length) return "";
  const summaryLines = meetingSummaries
    .map((s, i) => `  ${i + 1}. ${s}`)
    .join("\n");
  return [
    "--- PROJECT CONTEXT ---",
    `Project: ${projectName} (${projectId})`,
    "Recent meeting summaries:",
    summaryLines,
    "--- END CONTEXT ---",
  ].join("\n");
}
