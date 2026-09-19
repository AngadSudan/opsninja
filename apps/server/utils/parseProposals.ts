import type { ActionProposal } from "./agent.types";

export function extractProposals(answer: string): {
  cleanAnswer: string;
  proposals: ActionProposal[];
} {
  const proposals: ActionProposal[] = [];
  const regex = /<<ACTION_PROPOSAL>>([\s\S]*?)<<ACTION_PROPOSAL>>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(answer)) !== null) {
    const captured = match[1];
    if (!captured) continue;
    try {
      const parsed = JSON.parse(captured.trim());
      proposals.push(parsed as ActionProposal);
    } catch {
      // malformed block — skip
    }
  }

  const cleanAnswer = answer.replace(/<<ACTION_PROPOSAL>>[\s\S]*?<<ACTION_PROPOSAL>>/g, "").trim();
  return { cleanAnswer, proposals };
}
