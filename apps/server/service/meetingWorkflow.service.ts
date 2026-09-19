import type { ActionProposal } from "../utils/agent.types";
import type { JiraCredentials } from "./jira.service";
import jiraService from "./jira.service";
import type { SlackCredentials } from "./slack.service.ts";
import slackService from "./slack.service.ts";
import transcriptProcessorService from "./transcriptProcessor.service";
import vaultService from "./vault.service.ts";
import graphService from "./graph.service";

type IntegrationCredentials = {
  jira?: JiraCredentials;
  slack?: SlackCredentials;
};

const getString = (value: unknown, key: string) =>
  value &&
  typeof value === "object" &&
  key in value &&
  typeof (value as Record<string, unknown>)[key] === "string"
    ? (value as Record<string, string>)[key]
    : undefined;

export class MeetingWorkflowService {
  async ingestTranscript(transcript: string) {
    console.log(`[MeetingWorkflowService] Starting transcript ingestion...`);

    let minutes;
    let structured;
    try {
      structured =
        await transcriptProcessorService.processTranscript(transcript);
      minutes = structured.minutes;
      console.log(
        `[MeetingWorkflowService] Transcript processed: ${minutes.actionItems.length} actions, ${minutes.decisions.length} decisions`,
      );
    } catch (error) {
      console.error(
        `[MeetingWorkflowService] Failed to process transcript:`,
        error,
      );
      throw new Error(
        `Failed to create MOM: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const actions: ActionProposal[] = minutes.actionItems
      .filter(
        (action) =>
          action.externalAction === "jira" || action.externalAction === "slack",
      )
      .map((action) => ({
        actionNoteId: `action-${Date.now()}-${Math.random()}`,
        type: action.externalAction as "jira" | "slack",
        title: action.title,
        description: action.description,
        target: action.target,
        assignee: action.assignee,
        priority: action.priority,
      }));

    console.log(
      `[MeetingWorkflowService] Generated ${actions.length} action proposals`,
    );

    return {
      minutes,
      shortname: structured.shortname,
      description: structured.description,
      meeting: { id: `meeting-${Date.now()}` },
      proposals: actions,
      actions: structured.actions,
    };
  }

  async executeApprovedAction(input: {
    proposal: ActionProposal;
    approvedBy: string;
    credentials: IntegrationCredentials;
  }) {
    if (!input.approvedBy.trim()) {
      throw new Error(
        "An approvedBy value is required before executing an external action",
      );
    }

    if (input.proposal.type === "jira") {
      if (!input.credentials.jira) throw new Error("Jira is not connected");
      if (!input.proposal.target)
        throw new Error("A Jira project key is required for this proposal");

      const issue = await jiraService.createIssue(input.credentials.jira, {
        projectKey: input.proposal.target,
        summary: input.proposal.title,
        description: input.proposal.description,
        priority: input.proposal.priority,
      });
      const issueKey = getString(issue, "key") ?? getString(issue, "id");
      if (!issueKey) throw new Error("Jira did not return an issue key");

      const jiraUrl = input.credentials.jira.siteUrl
        ? `${input.credentials.jira.siteUrl.replace(/\/$/, "")}/browse/${issueKey}`
        : undefined;
      const jiraNote = await vaultService.createNote({
        folder: "Jira",
        title: issueKey,
        content: `# ${issueKey}\n\n**Summary:** ${input.proposal.title}\n${jiraUrl ? `**URL:** ${jiraUrl}\n` : ""}\n## Source\n\n- [[${input.proposal.actionNoteId}]]\n`,
      });
      await vaultService.updateNote(
        input.proposal.actionNoteId,
        `## Execution\n\n**Status:** Executed\n**Approved by:** ${input.approvedBy}\n**Jira:** [[${jiraNote.id}]]`,
        true,
      );
      return {
        type: "jira" as const,
        issueKey,
        vaultNoteId: jiraNote.id,
        issue,
      };
    }

    if (!input.credentials.slack) throw new Error("Slack is not connected");
    if (!input.proposal.target)
      throw new Error("A Slack channel is required for this proposal");
    const message = input.proposal.description ?? input.proposal.title;
    const sent = await slackService.sendMessage(
      input.credentials.slack,
      input.proposal.target,
      message,
    );
    const channel = getString(sent, "channel") ?? input.proposal.target;
    const timestamp = getString(sent, "ts");
    const slackNote = await vaultService.createNote({
      folder: "Slack",
      title: `${channel}-${timestamp ?? Date.now()}`,
      content: `# Slack message to #${channel}\n\n${message}\n\n**Source:** [[${input.proposal.actionNoteId}]]\n${timestamp ? `**Timestamp:** ${timestamp}\n` : ""}`,
    });
    await vaultService.updateNote(
      input.proposal.actionNoteId,
      `## Execution\n\n**Status:** Executed\n**Approved by:** ${input.approvedBy}\n**Slack:** [[${slackNote.id}]]`,
      true,
    );
    return { type: "slack" as const, vaultNoteId: slackNote.id, sent };
  }
}

export default new MeetingWorkflowService();
