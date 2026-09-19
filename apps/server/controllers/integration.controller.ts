import integrationRepository from "../repository/integration.repository";
import userRepository from "../repository/user.repository";
import type { Integration } from "../utils/type";

class IntegrationController {
  async getMyIntegrations(userId: string): Promise<Omit<Integration, "atlassian_access_token" | "atlassian_refresh_token" | "slack_token">[]> {
    if (!userId) throw new Error("userId is required");

    const integrations = await integrationRepository.findIntegrationsByUserId(userId);
    return integrations.map(({ atlassian_access_token, atlassian_refresh_token, slack_token, ...safe }) => safe);
  }

  async disconnectIntegration(
    userId: string,
    platform: "jira" | "slack" | "calendar",
  ): Promise<{ success: boolean }> {
    if (!userId) throw new Error("userId is required");
    if (!platform) throw new Error("platform is required");

    const integrations = await integrationRepository.findIntegrationsByUserId(userId);

    for (const integration of integrations) {
      await integrationRepository.deleteIntegration(integration.integration_id);
    }

    const userField: Record<string, boolean> = {
      jira: false,
      slack: false,
      calendar: false,
    };

    const fieldMap: Record<string, string> = {
      jira: "atlassian_connected",
      slack: "slack_connected",
      calendar: "calendar_connected",
    };

    const updateField = fieldMap[platform];
    if (updateField) {
      await userRepository.updateUser(userId, { [updateField]: false } as any);
    }

    return { success: true };
  }
}

export default new IntegrationController();
