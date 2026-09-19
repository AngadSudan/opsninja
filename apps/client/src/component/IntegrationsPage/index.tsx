"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMyIntegrations,
  useDisconnectIntegration,
} from "@/hooks/useIntegration";
import ConfirmDialog from "@/component/ConfirmDialog";

const PLATFORMS: Array<{
  platform: "jira" | "slack" | "calendar";
  name: string;
  symbol: string;
  description: string;
  color: string;
  badgeBg: string;
}> = [
  {
    platform: "jira",
    name: "Atlassian Jira",
    symbol: "◇",
    description:
      "Turn approved action items into traceable issues and tickets in your Jira projects.",
    color: "text-[#3564a8]",
    badgeBg: "bg-[#edf3ff]",
  },
  {
    platform: "slack",
    name: "Slack",
    symbol: "#",
    description:
      "Prepare follow-up summaries and action proposals for team channels where work happens.",
    color: "text-[#b5522c]",
    badgeBg: "bg-[#fff1e9]",
  },
  {
    platform: "calendar",
    name: "Google Calendar",
    symbol: "◎",
    description:
      "Keep meeting context, participants, and follow-up agendas synchronized with your calendar.",
    color: "text-[#2f7447]",
    badgeBg: "bg-[#f0f8ef]",
  },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { data: integrations, isLoading, isError } = useMyIntegrations();
  const disconnect = useDisconnectIntegration();

  const [platformToDisconnect, setPlatformToDisconnect] = useState<
    "jira" | "slack" | "calendar" | null
  >(null);
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");

  const isPlatformConnected = (platform: "jira" | "slack" | "calendar") => {
    if (platform === "jira") {
      return Boolean(
        user?.atlassian_connected ||
          integrations?.some(
            (i: any) =>
              i.atlassian_cloud_id ||
              i.atlassian_site_url ||
              i.platform === "jira" ||
              i.connected === true
          )
      );
    }
    if (platform === "slack") {
      return Boolean(
        user?.slack_connected ||
          integrations?.some((i: any) => i.slack_token || i.platform === "slack")
      );
    }
    if (platform === "calendar") {
      return Boolean(
        user?.calendar_connected ||
          integrations?.some((i: any) => i.platform === "calendar")
      );
    }
    return false;
  };

  const getConnectedSiteUrl = () => {
    const jiraItem = integrations?.find(
      (i: any) => i.atlassian_site_url
    ) as any;
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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#dfe5dc] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#59745b]">
              Workspace Configuration
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Connected Integrations
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#596257]">
            Connect external issue trackers and communication channels. Ops Ninja drafts tickets and summaries behind an unbypassable human approval gate.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#16a34a]/25 bg-[#f0fdf4] px-3.5 py-1.5 text-xs font-bold text-[#15803d]">
          <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
          <span>Approval Gate Active</span>
        </div>
      </section>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-px overflow-hidden border border-[#dfe5dc] bg-[#dfe5dc] md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white p-8"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load integration status. Please check your connection and try again.
        </div>
      )}

      {/* Platforms Grid */}
      {!isLoading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((tool) => {
            const connected = isPlatformConnected(tool.platform);
            const siteUrl = tool.platform === "jira" ? getConnectedSiteUrl() : undefined;

            return (
              <div
                key={tool.platform}
                className="group flex flex-col justify-between bg-white p-5 transition hover:bg-[#f8faf7]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold shadow-xs ${tool.badgeBg} ${tool.color}`}
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

                  <p className="mt-2.5 text-xs leading-relaxed text-[#596257]">
                    {tool.description}
                  </p>

                  {connected && siteUrl && (
                    <div className="mt-5 rounded-2xl border border-[#edf0eb] bg-[#fafaf8] p-3 text-xs text-[#596257]">
                      <span className="font-semibold text-[#8a9587]">Site Domain: </span>
                      <span className="font-mono text-[#20251f]">{siteUrl}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 border-t border-[#f0f3ee] pt-5">
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => setPlatformToDisconnect(tool.platform)}
                      disabled={disconnect.isPending}
                      className="w-full rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  ) : tool.platform === "jira" ? (
                    <button
                      type="button"
                      onClick={() => setJiraModalOpen(true)}
                      className="w-full rounded-xl bg-[#20251f] py-2.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] active:scale-[0.98]"
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
                      className="w-full rounded-xl border border-[#dfe5dc] bg-white py-2.5 text-xs font-bold text-[#596257] transition hover:border-[#20251f]/30 hover:bg-[#fafaf8]"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#dfe5dc] bg-white p-7 sm:p-9 shadow-2xl shadow-[#20251f]/15 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf3ff] text-[#3564a8] font-bold text-lg shadow-xs">
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
                ✕
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
                className="mt-2 w-full rounded-2xl border border-[#dfe5dc] bg-[#fafaf8] px-4 py-3 text-sm text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:bg-white focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
              />

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#f0f3ee] pt-5">
                <button
                  type="button"
                  onClick={() => setJiraModalOpen(false)}
                  className="rounded-xl border border-[#dfe5dc] bg-white px-5 py-2.5 text-xs font-bold text-[#596257] transition hover:border-[#20251f]/30 hover:bg-[#fafaf8] hover:text-[#20251f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#20251f] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] active:scale-[0.98]"
                >
                  Continue to Atlassian →
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
