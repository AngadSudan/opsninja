import actionRepository from "../repository/action.repository";
import meetingWorkflowService from "../service/meetingWorkflow.service";
import graphService from "../service/graph.service";
import type { MeetingActionItem, UpdateActionDTO } from "../utils/type";
import type { ActionProposal } from "../utils/agent.types";
import type { JiraCredentials } from "../agent/jira.agent";
import type { SlackCredentials } from "../agent/slack.agent";

class ActionController {
  async getAllActions(meetingId: string): Promise<MeetingActionItem[]> {
    if (!meetingId) throw new Error("meetingId is required");
    return await actionRepository.findActionsByMeetingId(meetingId);
  }

  async executeAction(
    actionId: string,
    approvedBy: string,
    proposal: ActionProposal,
    credentials: { jira?: JiraCredentials; slack?: SlackCredentials },
  ): Promise<{ action_id: string; action_status: string; result: unknown }> {
    if (!actionId) throw new Error("actionId is required");
    if (!approvedBy?.trim()) throw new Error("approved_by is required");

    const action = await actionRepository.findActionById(actionId);
    if (!action) throw new Error("action not found");
    if (action.action_status !== "pending") {
      throw new Error("action is not in pending status");
    }

    let result: unknown;
    let finalStatus: MeetingActionItem["action_status"] = "success";

    try {
      result = await meetingWorkflowService.executeApprovedAction({
        proposal,
        approvedBy,
        credentials,
      });
    } catch (err: any) {
      finalStatus = "failed";
      await actionRepository.updateAction(actionId, {
        action_status: "failed",
        action_by: approvedBy,
        error_message: err.message,
      });
      throw err;
    }

    await actionRepository.updateAction(actionId, {
      action_status: finalStatus,
      action_by: approvedBy,
    });

    try {
      await graphService.linkActionResult(actionId, result);
    } catch {
      // Neptune failure must not break the action response
    }

    return { action_id: actionId, action_status: finalStatus, result };
  }

  async updateActionStatus(
    actionId: string,
    updates: UpdateActionDTO,
  ): Promise<MeetingActionItem> {
    if (!actionId) throw new Error("actionId is required");
    if (!updates.action_status) throw new Error("action_status is required");

    const action = await actionRepository.findActionById(actionId);
    if (!action) throw new Error("action not found");

    const updated = await actionRepository.updateAction(actionId, updates);
    if (!updated) throw new Error("failed to update action");

    return updated;
  }
}

export default new ActionController();
