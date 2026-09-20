"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMyIntegrations,
  useDisconnectIntegration,
} from "@/hooks/useIntegration";
import ConfirmDialog from "@/component/ConfirmDialog";

type IntegrationMetadata = {
  platform?: "jira" | "slack" | "calendar" | string;
  connected?: boolean;
  atlassian_cloud_id?: string | null;
  atlassian_site_url?: string | null;
  slack_token?: string | null;
};

const PLATFORMS: Array<{
  platform: "jira" | "slack" | "calendar";
  name: string;
  description: string;
  capability: string;
}> = [
  {
    platform: "jira",
    name: "Jira",
    description: "Issue creation and updates",
    capability: "Approved meeting actions can become assigned Jira work with project context attached.",
  },
  {
    platform: "slack",
    name: "Slack",
    description: "Channel update proposals",
    capability: "Approved decisions can post concise updates to the right channel with source context.",
  },
  {
    platform: "calendar",
    name: "Google Calendar",
    description: "Meeting synchronization",
    capability: "Meetings stay connected to the operational record that follows them.",
  },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { data: integrations, isLoading, isError } = useMyIntegrations();
  const disconnect = useDisconnectIntegration();
  const integrationList = (integrations ?? []) as IntegrationMetadata[];

  const [platformToDisconnect, setPlatformToDisconnect] = useState<
    "jira" | "slack" | "calendar" | null
  >(null);
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");

  const isPlatformConnected = (platform: "jira" | "slack" | "calendar") => {
    if (platform === "jira") {
      return Boolean(
        user?.atlassian_connected ||
          integrationList.some(
            (integration) =>
              integration.atlassian_cloud_id ||
              integration.atlassian_site_url ||
              integration.platform === "jira" ||
              integration.connected === true,
          ),
      );
    }
    if (platform === "slack") {
      return Boolean(
        user?.slack_connected ||
          integrationList.some(
            (integration) =>
              integration.slack_token || integration.platform === "slack",
          ),
      );
    }
    return Boolean(
      user?.calendar_connected ||
        integrationList.some((integration) => integration.platform === "calendar"),
    );
  };

  const getConnectedSiteUrl = () => {
    const jiraItem = integrationList.find(
      (integration) => integration.atlassian_site_url,
    );
    return jiraItem?.atlassian_site_url;
  };

  const handleConnectJira = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const url = jiraSiteUrl.trim();
    if (!url) return;

    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(
      `${apiBase}/api/v1/auth/jira?user_id=${user.user_id}&site_url=${encodeURIComponent(formattedUrl)}`,
      "_self",
    );
  };

  const handleDisconnect = async () => {
    if (platformToDisconnect) {
      await disconnect.mutateAsync(platformToDisconnect);
      setPlatformToDisconnect(null);
    }
  };

  return (
    <div className="workspace-page">
      <section className="border-b border-[var(--line)] pb-8">
        <p className="text-sm font-semibold text-[var(--ink-3)]">Integrations</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight">Connected tools</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-2)]">
          Connect external systems. Ops Ninja drafts work from evidence, then
          waits for approval before anything leaves the workspace.
        </p>
      </section>

      <section className="grid gap-px border-b border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
        {["Draft", "Review", "Execute"].map((title) => (
          <div key={title} className="bg-[var(--page)] py-6 md:px-6 md:first:pl-0 md:last:pr-0">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">
              {title === "Draft"
                ? "Ops Ninja proposes external work from meeting evidence."
                : title === "Review"
                  ? "A human verifies payload, destination, and provenance."
                  : "Only approved actions are sent to connected tools."}
            </p>
          </div>
        ))}
      </section>

      {isLoading && (
        <div className="divide-y divide-[var(--line)]">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse bg-white/60" />
          ))}
        </div>
      )}

      {isError && (
        <div className="border-b border-[var(--line)] py-8 text-sm text-[var(--red)]">
          Failed to load integration status. Please check your connection and try again.
        </div>
      )}

      {!isLoading && (
        <div className="divide-y divide-[var(--line)]">
          {PLATFORMS.map((tool) => {
            const connected = isPlatformConnected(tool.platform);
            const siteUrl = tool.platform === "jira" ? getConnectedSiteUrl() : undefined;

            return (
              <section
                key={tool.platform}
                className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)_12rem]"
              >
                <div>
                  <h2 className="text-2xl font-bold">{tool.name}</h2>
                  <p className="mt-2 text-sm text-[var(--ink-3)]">{tool.description}</p>
                </div>
                <div>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--ink-2)]">
                    {tool.capability}
                  </p>
                  {connected && siteUrl && (
                    <p className="mt-2 break-all text-sm text-[var(--ink-3)]">
                      {siteUrl}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <span className={`status-text ${connected ? "status-success" : "status-muted"}`}>
                    {connected ? "Connected" : "Connect"}
                  </span>
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => setPlatformToDisconnect(tool.platform)}
                      disabled={disconnect.isPending}
                      className="text-sm font-bold text-[var(--red)] hover:underline disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  ) : tool.platform === "jira" ? (
                    <button
                      type="button"
                      onClick={() => setJiraModalOpen(true)}
                      className="primary-action"
                    >
                      Connect Jira
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `${tool.name} OAuth connector will be available soon. Jira integration is active.`,
                        )
                      }
                      className="secondary-action"
                    >
                      Configure
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {jiraModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jira-connect-title"
        >
          <div className="w-full max-w-md rounded-[5px] border border-[var(--line)] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="jira-connect-title" className="text-2xl font-bold tracking-tight">
                  Connect Jira
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-2)]">
                  Enter your Atlassian site URL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJiraModalOpen(false)}
                className="min-h-10 rounded-[5px] px-3 text-sm font-bold text-[var(--ink-3)] hover:bg-[var(--page)] hover:text-[var(--ink)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleConnectJira} className="mt-6">
              <label htmlFor="jira-url" className="text-sm font-bold">
                Jira site URL
              </label>
              <input
                id="jira-url"
                type="text"
                required
                value={jiraSiteUrl}
                onChange={(event) => setJiraSiteUrl(event.target.value)}
                placeholder="https://yourcompany.atlassian.net"
                className="mt-2 min-h-11 w-full rounded-[5px] border border-[var(--line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--orange)]"
              />

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setJiraModalOpen(false)}
                  className="secondary-action"
                >
                  Cancel
                </button>
                <button type="submit" className="primary-action">
                  Continue to Atlassian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(platformToDisconnect)}
        title={`Disconnect ${
          platformToDisconnect
            ? PLATFORMS.find((platform) => platform.platform === platformToDisconnect)?.name
            : "integration"
        }?`}
        message="This will remove stored tokens and disable action proposals for this tool. You can reconnect at any time."
        confirmText="Disconnect"
        cancelText="Keep connected"
        isDestructive={true}
        onConfirm={handleDisconnect}
        onCancel={() => setPlatformToDisconnect(null)}
      />
    </div>
  );
}
