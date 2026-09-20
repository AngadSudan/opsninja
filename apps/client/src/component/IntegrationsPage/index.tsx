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
  symbol: string;
  description: string;
  consequence: string;
  color: string;
  badgeBg: string;
}> = [
  {
    platform: "jira",
    name: "Atlassian Jira",
    symbol: "◇",
    description:
      "Turn approved action items into traceable issues and tickets in your Jira projects.",
    consequence: "Approved meeting actions can become assigned Jira work with project context attached.",
    color: "text-[#3564a8]",
    badgeBg: "bg-[#edf3ff]",
  },
  {
    platform: "slack",
    name: "Slack",
    symbol: "#",
    description:
      "Prepare follow-up summaries and action proposals for team channels where work happens.",
    consequence: "Review-ready decisions can be posted to the right channel with source context.",
    color: "text-[#b5522c]",
    badgeBg: "bg-[#fff1e9]",
  },
  {
    platform: "calendar",
    name: "Google Calendar",
    symbol: "◎",
    description:
      "Keep meeting context, participants, and follow-up agendas synchronized with your calendar.",
    consequence: "Meetings stay connected to the operational record that follows them.",
    color: "text-[#2f7447]",
    badgeBg: "bg-[#f0f8ef]",
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
              integration.connected === true
          )
      );
    }
    if (platform === "slack") {
      return Boolean(
        user?.slack_connected ||
          integrationList.some(
            (integration) =>
              integration.slack_token || integration.platform === "slack",
          )
      );
    }
    if (platform === "calendar") {
      return Boolean(
        user?.calendar_connected ||
          integrationList.some((integration) => integration.platform === "calendar")
      );
    }
    return false;
  };

  const getConnectedSiteUrl = () => {
    const jiraItem = integrationList.find(
      (integration) => integration.atlassian_site_url
    );
    return jiraItem?.atlassian_site_url;
  };

  const handleConnectJira = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const url = jiraSiteUrl.trim();
    if (!url) return;

    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(
      `${apiBase}/api/v1/auth/jira?user_id=${user.user_id}&site_url=${encodeURIComponent(formattedUrl)}`,
      "_self"
    );
  };

  const handleDisconnect = async () => {
    if (platformToDisconnect) {
      await disconnect.mutateAsync(platformToDisconnect);
      setPlatformToDisconnect(null);
    }
  };

  return (
    <div className="workspace-page space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-[#ddd5c9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c3562c]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9f3f1e]">
              Workspace Configuration
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Connected Integrations
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#665f55]">
            Connect external issue trackers and communication channels. Ops Ninja drafts tickets and summaries behind an unbypassable human approval gate.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#208c55]/25 bg-[#e9f6ef] px-3.5 py-1.5 text-xs font-bold text-[#1e7048]">
          <span className="h-2 w-2 rounded-full bg-[#208c55] animate-pulse" />
          <span>Approval Gate Active</span>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#ddd5c9] md:grid-cols-3">
        {[
          ["Draft", "Ops Ninja proposes an external action from meeting evidence."],
          ["Review", "A human verifies payload, destination, and provenance."],
          ["Execute", "Only approved actions are sent to connected tools."],
        ].map(([title, body]) => (
          <div key={title} className="bg-[#fffdfa] p-4">
            <p className="text-sm font-bold text-[#1c1b17]">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#665f55]">{body}</p>
          </div>
        ))}
      </section>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-px overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#ddd5c9] md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse bg-white p-8"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load integration status. Please check your connection and try again.
        </div>
      )}

      {/* Platforms Grid */}
      {!isLoading && (
        <div className="grid gap-px overflow-hidden rounded-lg border border-[#dfe5dc] bg-[#dfe5dc] md:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((tool) => {
            const connected = isPlatformConnected(tool.platform);
            const siteUrl = tool.platform === "jira" ? getConnectedSiteUrl() : undefined;

            return (
              <div
                key={tool.platform}
                className="group flex min-h-80 flex-col justify-between bg-[#fffdfa] p-5 transition hover:bg-[#fbfaf7]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold ${tool.badgeBg} ${tool.color}`}
                    >
                      {tool.symbol}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        connected
                          ? "bg-[#eaf6ec] text-[#347146] border border-[#16a34a]/20"
                          : "bg-[#f5f7f4] text-[#8a9587] border border-[#dfe5dc]"
                      }`}
                    >
                      <i
                        className={`h-1.5 w-1.5 rounded-full ${
                          connected ? "bg-[#16a34a]" : "bg-[#8a9587]"
                        }`}
                      />
                      {connected ? "Connected" : "Disconnected"}
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-bold text-[#20251f]">
                    {tool.name}
                  </h2>

                  <p className="mt-2.5 text-xs leading-relaxed text-[#665f55]">
                    {tool.description}
                  </p>

                  <div className="mt-5 rounded-lg border border-[#e8e0d4] bg-[#fbfaf7] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9f3f1e]">
                      Operational consequence
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#665f55]">
                      {tool.consequence}
                    </p>
                  </div>

                  {connected && siteUrl && (
                    <div className="mt-5 overflow-hidden rounded-lg border border-[#edf0eb] bg-[#fafaf8] p-3 text-xs text-[#596257]">
                      <span className="font-semibold text-[#8a8175]">Site Domain: </span>
                      <span className="break-all font-mono text-[#20251f]">{siteUrl}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 border-t border-[#e8e0d4] pt-5">
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => setPlatformToDisconnect(tool.platform)}
                      disabled={disconnect.isPending}
                      className="w-full rounded-lg border border-red-200 bg-white py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  ) : tool.platform === "jira" ? (
                    <button
                      type="button"
                      onClick={() => setJiraModalOpen(true)}
                      className="w-full rounded-lg bg-[#20251f] py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31] active:scale-[0.98]"
                    >
                      Connect Atlassian Jira
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `${tool.name} OAuth connector will be available soon. Jira integration is active!`
                        )
                      }
                      className="w-full rounded-lg border border-[#dfe5dc] bg-white py-2.5 text-xs font-bold text-[#596257] transition hover:border-[#20251f]/30 hover:bg-[#fafaf8]"
                    >
                      Configure {tool.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Jira Connect Modal */}
      {jiraModalOpen && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101510]/55 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-lg border border-[#dfe5dc] bg-white p-6 shadow-2xl shadow-[#20251f]/15 animate-in zoom-in-95 duration-200 sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf3ff] text-lg font-bold text-[#3564a8]">
                  ◇
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#20251f]">
                    Connect Atlassian Jira
                  </h2>
                  <p className="text-xs text-[#596257]">
                    OAuth 2.0 PKCE authentication
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setJiraModalOpen(false)}
                className="rounded-lg p-1.5 text-xs text-[#8a9587] transition hover:bg-[#f0f3ee] hover:text-[#20251f]"
              >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              </button>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-[#596257]">
              Enter your Atlassian site domain to link your Jira projects. You will be redirected to Atlassian to grant access.
            </p>

            <form onSubmit={handleConnectJira} className="mt-6">
              <label
                htmlFor="jira-url"
                className="block text-xs font-bold uppercase tracking-wider text-[#59745b]"
              >
                Jira Site URL <span className="text-[#c2491d]">*</span>
              </label>
              <input
                id="jira-url"
                type="text"
                required
                value={jiraSiteUrl}
                onChange={(e) => setJiraSiteUrl(e.target.value)}
                placeholder="https://yourcompany.atlassian.net"
                className="mt-2 w-full rounded-lg border border-[#dfe5dc] bg-[#fafaf8] px-4 py-3 text-sm text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#59745b]/10"
              />

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#f0f3ee] pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setJiraModalOpen(false)}
                  className="secondary-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action"
                >
                  Continue to Atlassian
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(platformToDisconnect)}
        title={`Disconnect ${
          platformToDisconnect ? PLATFORMS.find((p) => p.platform === platformToDisconnect)?.name : "Integration"
        }?`}
        message="This will remove stored tokens and disable automated action proposals for this tool. You can reconnect at any time."
        confirmText="Disconnect"
        cancelText="Keep Connected"
        isDestructive={true}
        onConfirm={handleDisconnect}
        onCancel={() => setPlatformToDisconnect(null)}
      />
    </div>
  );
}
