import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { MeetingAction, MeetingMinutes } from "../utils/agent.types";

import fs from "node:fs";

type Tool = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  callback: (input: any) => unknown;
};

const tool = (definition: Tool): Tool => definition;

const vaultFolderSchema = z.enum([
  "Meetings",
  "Actions",
  "Decisions",
  "People",
  "Projects",
  "Risks",
  "Topics",
  "Jira",
  "Slack",
]);

const slugify = (value: string | undefined) =>
  value
    ? value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 90) || "untitled"
    : "untitled";

const normalizeId = (noteId: string) =>
  noteId.replace(/\\/g, "/").replace(/\.md$/, "");

export type VaultNote = {
  id: string;
  content: string;
};

export type ActionNote = {
  id: string;
  action: MeetingAction;
};

export class VaultService {
  get root(): string {
    if (process.env.OBSIDIAN_VAULT_PATH) {
      return path.resolve(process.env.OBSIDIAN_VAULT_PATH);
    }
    try {
      const home = process.env.HOME || "/home/adheesh";
      const configPath = path.join(home, ".config/obsidian/obsidian.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (config.vaults) {
          for (const key of Object.keys(config.vaults)) {
            const v = config.vaults[key];
            if (v.open && v.path && fs.existsSync(v.path)) {
              return v.path;
            }
          }
        }
      }
    } catch {}
    return path.resolve(process.cwd(), "vault");
  }

  async ensureVault() {
    await Promise.all(
      [
        "Meetings",
        "Actions",
        "Decisions",
        "People",
        "Projects",
        "Risks",
        "Topics",
        "Jira",
        "Slack",
      ].map((folder) =>
        mkdir(path.join(this.root, folder), { recursive: true }),
      ),
    );
  }


  private getPath(noteId: string) {
    const normalizedId = normalizeId(noteId);
    if (
      !normalizedId ||
      path.isAbsolute(normalizedId) ||
      normalizedId.includes("..")
    ) {
      throw new Error("Invalid vault note id");
    }

    const filePath = path.resolve(this.root, `${normalizedId}.md`);
    if (!filePath.startsWith(`${this.root}${path.sep}`)) {
      throw new Error("Vault note id resolves outside the vault");
    }
    return filePath;
  }

  private toId(filePath: string) {
    return path
      .relative(this.root, filePath)
      .replace(/\\/g, "/")
      .replace(/\.md$/, "");
  }

  async createNote(input: {
    folder: z.infer<typeof vaultFolderSchema>;
    title: string;
    content: string;
  }): Promise<VaultNote> {
    await this.ensureVault();
    const id = `${input.folder}/${slugify(input.title)}`;
    const filePath = this.getPath(id);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.content.trimEnd() + "\n", "utf8");
    return { id, content: input.content.trimEnd() + "\n" };
  }

  async readNote(noteId: string): Promise<VaultNote> {
    const id = normalizeId(noteId);
    return { id, content: await readFile(this.getPath(id), "utf8") };
  }

  async updateNote(
    noteId: string,
    content: string,
    append = false,
  ): Promise<VaultNote> {
    const existing = append
      ? (await this.readNote(noteId)).content.trimEnd()
      : "";
    const nextContent = `${existing}${existing ? "\n\n" : ""}${content.trim()}`;
    const filePath = this.getPath(noteId);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${nextContent}\n`, "utf8");
    return { id: normalizeId(noteId), content: `${nextContent}\n` };
  }

  async searchNotes(query: string, limit = 10) {
    await this.ensureVault();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const files = await this.findMarkdownFiles(this.root);
    const matches: Array<{ id: string; excerpt: string }> = [];

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const haystack = content.toLowerCase();
      const score = terms.filter((term) => haystack.includes(term)).length;
      if (score === 0) continue;

      const firstIndex = Math.max(
        0,
        Math.min(
          ...terms
            .map((term) => haystack.indexOf(term))
            .filter((index) => index >= 0),
        ) - 120,
      );
      matches.push({
        id: this.toId(file),
        excerpt: content
          .slice(firstIndex, firstIndex + 500)
          .replace(/\s+/g, " ")
          .trim(),
      });
    }

    return matches.slice(0, limit);
  }

  private async findMarkdownFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return this.findMarkdownFiles(entryPath);
        return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
      }),
    );
    return nested.flat();
  }

  async getRelatedNotes(noteId: string) {
    const { content } = await this.readNote(noteId);
    return [...content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map(
      (match) => match[1]!,
    );
  }

  async getMeeting(meetingId: string) {
    const normalizedId = normalizeId(meetingId);
    if (!normalizedId.startsWith("Meetings/")) {
      throw new Error("Meeting note ids must start with Meetings/");
    }
    return this.readNote(normalizedId);
  }

  async getActionItems(meetingId: string) {
    const meeting = await this.getMeeting(meetingId);
    const actionIds = [
      ...meeting.content.matchAll(/\[\[(Actions\/[^\]|]+)(?:\|[^\]]+)?\]\]/g),
    ].map((match) => match[1]!);

    return Promise.all(
      actionIds.map(async (actionId) => {
        const note = await this.readNote(actionId);
        const status = note.content.match(/\*\*Status:\*\*\s*([^\n]+)/)?.[1];
        return {
          id: note.id,
          status: status ?? "Unknown",
          content: note.content,
        };
      }),
    );
  }

  async linkNotes(sourceNoteId: string, targetNoteId: string) {
    await this.readNote(targetNoteId);
    return this.updateNote(
      sourceNoteId,
      `## Related\n\n- [[${normalizeId(targetNoteId)}]]`,
      true,
    );
  }

  async saveMeetingMinutes(minutes: MeetingMinutes): Promise<VaultNote> {
    const datePrefix = minutes.date ? `${minutes.date} ` : "";
    const title = `${datePrefix}${minutes.title}`.trim();
    const actionRows = minutes.actionItems.length
      ? minutes.actionItems
          .map((action) => {
            const details = [
              action.assignee ? `Assignee: ${action.assignee}` : undefined,
              action.dueDate ? `Due: ${action.dueDate}` : undefined,
              `Priority: ${action.priority}`,
              action.externalAction !== "none"
                ? `Proposed integration: ${action.externalAction}`
                : undefined,
            ].filter(Boolean);
            return `- [ ] [[Actions/${slugify(action.id)}|${action.title}]]${details.length ? `\n  - ${details.join("\n  - ")}` : ""}`;
          })
          .join("\n")
      : "- No action items were identified.";

    const section = (heading: string, values: string[]) =>
      values.length
        ? `## ${heading}\n\n${values.map((value) => `- ${value}`).join("\n")}\n\n`
        : "";
    const related = minutes.relatedTopics.map((topic) => `[[${topic}]]`);
    const followUp = minutes.followUp
      ? `## Next Follow-Up\n\n${[minutes.followUp.date, minutes.followUp.purpose].filter(Boolean).join(" - ")}\n\n`
      : "";

    return this.createNote({
      folder: "Meetings",
      title,
      content: `# ${minutes.title}\n\n${minutes.date ? `**Date:** ${minutes.date}\n\n` : ""}${minutes.participants.length ? `**Participants:** ${minutes.participants.join(", ")}\n\n` : ""}${minutes.objective ? `## Objective\n\n${minutes.objective}\n\n` : ""}## Summary\n\n${minutes.summary}\n\n${section("Decisions", minutes.decisions)}${section("Risks and Dependencies", minutes.risksAndDependencies)}## Action Items\n\n${actionRows}\n\n${followUp}${related.length ? `## Related\n\n${related.map((link) => `- ${link}`).join("\n")}\n` : ""}`,
    });
  }

  async saveActionNote(
    action: MeetingAction,
    meetingNoteId: string,
  ): Promise<ActionNote> {
    const note = await this.createNote({
      folder: "Actions",
      title: action.id,
      content: `# ${action.title}\n\n**Status:** Proposed\n**Source:** [[${meetingNoteId}]]\n**Priority:** ${action.priority}\n${action.assignee ? `**Assignee:** ${action.assignee}\n` : ""}${action.dueDate ? `**Due:** ${action.dueDate}\n` : ""}${action.externalAction !== "none" ? `**Integration:** ${action.externalAction}\n` : ""}${action.target ? `**Target:** ${action.target}\n` : ""}${action.description ? `\n## Details\n\n${action.description}\n` : ""}`,
    });
    return { id: note.id, action };
  }

  createTools(options: { allowWrites?: boolean } = {}): Tool[] {
    const readTools: Tool[] = [
      tool({
        name: "search_vault",
        description:
          "Search local Obsidian Markdown notes. Use this only when vault context is needed.",
        inputSchema: z.object({
          query: z.string().min(1),
          limit: z.number().int().min(1).max(25).optional(),
        }),
        callback: ({ query, limit }) => this.searchNotes(query, limit),
      }),
      tool({
        name: "read_note",
        description:
          "Read a vault note by its note ID, for example Meetings/product-sync.",
        inputSchema: z.object({ noteId: z.string().min(1) }),
        callback: ({ noteId }) => this.readNote(noteId),
      }),
      tool({
        name: "get_meeting",
        description: "Read a meeting note by its Meetings/... note ID.",
        inputSchema: z.object({ meetingId: z.string().min(1) }),
        callback: ({ meetingId }) => this.getMeeting(meetingId),
      }),
      tool({
        name: "get_action_items",
        description: "Get the action-item notes linked from a meeting note.",
        inputSchema: z.object({ meetingId: z.string().min(1) }),
        callback: ({ meetingId }) => this.getActionItems(meetingId),
      }),
      tool({
        name: "get_related_notes",
        description: "Return Obsidian links from a vault note.",
        inputSchema: z.object({ noteId: z.string().min(1) }),
        callback: ({ noteId }) => this.getRelatedNotes(noteId),
      }),
    ];

    if (!options.allowWrites) return readTools;

    return [
      ...readTools,
      tool({
        name: "create_note",
        description:
          "Create a local vault note after the user approved the operation.",
        inputSchema: z.object({
          folder: vaultFolderSchema,
          title: z.string().min(1),
          content: z.string(),
        }),
        callback: (input) => this.createNote(input),
      }),
      tool({
        name: "update_note",
        description:
          "Replace or append a local vault note after the user approved the operation.",
        inputSchema: z.object({
          noteId: z.string().min(1),
          content: z.string(),
          append: z.boolean().optional(),
        }),
        callback: ({ noteId, content, append }) =>
          this.updateNote(noteId, content, append),
      }),
      tool({
        name: "link_notes",
        description:
          "Link two local vault notes after the user approved the operation.",
        inputSchema: z.object({
          sourceNoteId: z.string().min(1),
          targetNoteId: z.string().min(1),
        }),
        callback: ({ sourceNoteId, targetNoteId }) =>
          this.linkNotes(sourceNoteId, targetNoteId),
      }),
    ];
  }
}

export default new VaultService();
