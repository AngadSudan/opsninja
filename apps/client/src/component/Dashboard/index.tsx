"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProject";
import { useMyIntegrations } from "@/hooks/useIntegration";
import CreateProjectModal from "@/component/CreateProjectModal";

type IntegrationMetadata = {
  platform?: "jira" | "slack" | "calendar" | string;
  atlassian_cloud_id?: string | null;
  slack_token?: string | null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: integrations } = useMyIntegrations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const integrationList = (integrations ?? []) as IntegrationMetadata[];

  // Compute connected status from integrations and user flags
  const isJiraConnected = Boolean(
    user?.atlassian_connected ||
    integrationList.some(
      (integration) =>
        integration.atlassian_cloud_id || integration.platform === "jira",
    ),
  );
  const isSlackConnected = Boolean(
    user?.slack_connected ||
    integrationList.some(
      (integration) =>
        integration.slack_token || integration.platform === "slack",
    ),
  );
  const isCalendarConnected = Boolean(
    user?.calendar_connected ||
    integrationList.some((integration) => integration.platform === "calendar"),
  );

  const connectedCount = [
    isJiraConnected,
    isSlackConnected,
    isCalendarConnected,
  ].filter(Boolean).length;
  const projectCount = projects?.length ?? 0;
  const recentProjects = projects?.slice(0, 4) ?? [];
  const attentionItems = [
    {
      title: "Review staged external actions",
      body: "Open the latest meeting record and approve only the payloads that match the evidence.",
      href: recentProjects[0]?.project_id
        ? `/project/${recentProjects[0].project_id}/meeting-summary`
        : "/projects",
      status: "Pending approval",
    },
    {
      title: "Ask project context before dispatch",
      body: "Use the contextual chat to verify decisions against meeting history and project memory.",
      href: recentProjects[0]?.project_id
        ? `/project/${recentProjects[0].project_id}/chat`
        : "/projects",
      status: "Provenance ready",
    },
  ];

  return (
    <div className="workspace-page space-y-6 overflow-x-hidden">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 border-b border-[#ddd5c9] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c97a17]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9f3f1e]">
              Command Center
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Welcome back{user?.user_name ? `, ${user.user_name}` : ""}.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#665f55]">
            Review what needs attention, resume recent meeting work, and keep execution behind the human gate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1c1b17] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2b2923] active:scale-[0.98]"
          >
            <span className="text-base leading-none">+</span>
            <span>New project</span>
          </button>
          <Link
            href="/integrations"
            className="inline-flex min-h-10 items-center gap-2.5 rounded-lg border border-[#dfe5dc] bg-white px-5 py-2.5 text-xs font-bold text-[#596257] transition hover:border-[#20251f]/30 hover:bg-[#fafaf8] hover:text-[#20251f]"
          >
            <span>Connected tools</span>
            <span className="rounded-full bg-[#f1f7ef] px-2 py-0.5 text-[10px] font-extrabold text-[#426347]">
              {connectedCount}/3
            </span>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="rounded-lg border border-[#ddd5c9] bg-[#fffdfa]">
          <div className="border-b border-[#e8e0d4] px-4 py-3">
            <h2 className="text-base font-bold text-[#1c1b17]">Attention queue</h2>
            <p className="text-xs text-[#706a60]">The next operational moves in the meeting-to-execution loop.</p>
          </div>
          <div className="divide-y divide-[#e8e0d4]">
            {attentionItems.map((item) => (
              <Link key={item.title} href={item.href} className="block p-4 transition hover:bg-[#fbfaf7]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="ops-status ops-status-pending">{item.status}</span>
                    <h3 className="mt-2 text-sm font-bold text-[#1c1b17]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#665f55]">{item.body}</p>
                  </div>
                  <span className="text-xs font-bold text-[#9f3f1e]">Open</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#1c1b17] bg-[#121615] p-4 text-[#ede8dd]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c98a64]">
            Current loop
          </p>
          <div className="mt-4 grid gap-2 text-xs font-semibold">
            {["Meeting captured", "Context indexed", "Actions staged", "Human review required", "Jira / Slack execution"].map((step, index) => (
              <div key={step} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>{step}</span>
                <span className={index < 2 ? "text-[#65c08c]" : index === 3 ? "text-[#e0b46f]" : "text-[#c9c2b5]"}>
                  {index < 2 ? "Ready" : index === 3 ? "Gate" : "After approval"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid items-stretch gap-px overflow-hidden rounded-lg border border-[#dfe5dc] bg-[#dfe5dc] sm:grid-cols-3">
        <Link
          href="/projects"
          className="group bg-white p-4 transition hover:bg-[#f5f8f4]"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#59745b]">
            <span>Active Projects</span>
            <span className="text-[#8a9587] transition group-hover:translate-x-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </div>
          <strong className="mt-2 block text-2xl font-extrabold tracking-tight text-[#20251f]">
            {projectsLoading ? "…" : String(projectCount).padStart(2, "0")}
          </strong>
          <p className="mt-2 text-xs text-[#7a8678]">
            {projectCount === 0
              ? "No active workspaces created"
              : "Operational projects indexed"}
          </p>
        </Link>

        <Link
          href="/integrations"
          className="group bg-white p-4 transition hover:bg-[#f5f8f4]"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#59745b]">
            <span>Connected Integrations</span>
            <span className="text-[#8a9587] transition group-hover:translate-x-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </div>
          <strong className="mt-2 block text-2xl font-extrabold tracking-tight text-[#20251f]">
            {String(connectedCount).padStart(2, "0")}
            <span className="text-xl font-normal text-[#8a9587]">/03</span>
          </strong>
          <p className="mt-2 text-xs text-[#7a8678]">
            {connectedCount > 0
              ? "Jira, Slack, or Calendar linked"
              : "Connect Jira to automate follow-up"}
          </p>
        </Link>

        <div className="bg-[#f1f7ef] p-4 text-[#426347]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            <span>Operational Memory</span>
          </div>
          <strong className="mt-2 block text-lg font-bold tracking-tight text-[#20251f]">
            Vault Synchronized
          </strong>
          <p className="mt-2 text-xs leading-relaxed text-[#59745b]">
            Transcripts, structured MOMs, and human-approved action gates are
            active.
          </p>
        </div>
      </section>

      {/* Main Grid: Projects & Quick Actions */}
      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        {/* Left: Recent Projects */}
        <div className="border border-[#dfe5dc] bg-white">
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#edf0eb] px-4 py-3">
            <h2 className="text-xl font-bold tracking-tight text-[#20251f]">
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs font-bold uppercase tracking-wider text-[#59745b] transition hover:text-[#20251f]"
            >
              View all ({projectCount})
            </Link>
          </div>

          {projectsLoading && (
            <div className="grid gap-px bg-[#edf0eb] sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse bg-white p-4" />
              ))}
            </div>
          )}

          {!projectsLoading && recentProjects.length === 0 && (
            <div className="m-4 rounded-lg border border-dashed border-[#cbd9c8] bg-[#fbfcfa] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#f4f8f2] text-xl text-[#59745b]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.1l2 2H18.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#20251f]">
                No projects yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#667166]">
                Create your first project to start organizing transcripts,
                AI-extracted MOMs, and follow-through actions.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
              >
                + Create first project
              </button>
            </div>
          )}

          {!projectsLoading && recentProjects.length > 0 && (
            <div className="grid divide-y divide-[#edf0eb]">
              {recentProjects.map((project) => (
                <Link
                  key={project.project_id}
                  href={`/project/${project.project_id}`}
              className="group flex min-h-40 flex-col justify-between p-4 transition hover:bg-[#f8faf7]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf2e8] text-xs font-bold text-[#59745b]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.1l2 2H18.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                        </svg>
                      </span>
                      <span className="text-xs text-[#8a9587]">
                        {new Date(
                          project.updated_at || project.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-[#20251f] group-hover:text-[#59745b] transition-colors">
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#667166]">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#59745b]">
                    <span>Open workspace</span>
                    <span className="transition group-hover:translate-x-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Integration Status & Workflows */}
        <div className="space-y-5">
          <div className="rounded-lg border border-[#dfe5dc] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#20251f]">
                Integration Status
              </h2>
              <Link
                href="/integrations"
                className="text-xs font-bold text-[#59745b] hover:underline"
              >
                Configure
              </Link>
            </div>
            <p className="mt-1 text-xs text-[#667166]">
              External tools wired for actions and sync.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0eb] bg-[#fafaf8] p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff] font-bold text-[#3564a8]">
                    ◇
                  </span>
                  <div>
                    <strong className="block text-xs text-[#20251f]">
                      Atlassian Jira
                    </strong>
                    <small className="text-[11px] text-[#7a8678]">
                      Issue creation & tracking
                    </small>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    isJiraConnected
                      ? "bg-[#eaf6ec] text-[#347146]"
                      : "bg-[#f5f7f4] text-[#8a9587]"
                  }`}
                >
                  <i
                    className={`h-1.5 w-1.5 rounded-full ${isJiraConnected ? "bg-[#16a34a]" : "bg-[#8a9587]"}`}
                  />
                  {isJiraConnected ? "Connected" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0eb] bg-[#fafaf8] p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1e9] font-bold text-[#b5522c]">
                    #
                  </span>
                  <div>
                    <strong className="block text-xs text-[#20251f]">
                      Slack
                    </strong>
                    <small className="text-[11px] text-[#7a8678]">
                      Channel message proposals
                    </small>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    isSlackConnected
                      ? "bg-[#eaf6ec] text-[#347146]"
                      : "bg-[#f5f7f4] text-[#8a9587]"
                  }`}
                >
                  <i
                    className={`h-1.5 w-1.5 rounded-full ${isSlackConnected ? "bg-[#16a34a]" : "bg-[#8a9587]"}`}
                  />
                  {isSlackConnected ? "Connected" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0eb] bg-[#fafaf8] p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f8ef] font-bold text-[#2f7447]">
                    ◎
                  </span>
                  <div>
                    <strong className="block text-xs text-[#20251f]">
                      Google Calendar
                    </strong>
                    <small className="text-[11px] text-[#7a8678]">
                      Meeting sync & events
                    </small>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    isCalendarConnected
                      ? "bg-[#eaf6ec] text-[#347146]"
                      : "bg-[#f5f7f4] text-[#8a9587]"
                  }`}
                >
                  <i
                    className={`h-1.5 w-1.5 rounded-full ${isCalendarConnected ? "bg-[#16a34a]" : "bg-[#8a9587]"}`}
                  />
                  {isCalendarConnected ? "Connected" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#dfe5dc] bg-white p-4">
            <h2 className="text-base font-bold text-[#20251f]">
              Quick Workflows
            </h2>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#edf0eb] p-4 text-left transition hover:border-[#dfe5dc] hover:bg-[#fafaf8]"
              >
                <div>
                  <strong className="block text-xs text-[#20251f]">
                    Create a new project
                  </strong>
                  <small className="text-[11px] text-[#7a8678]">
                    Organize meetings and context
                  </small>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f5ee] text-xs font-bold text-[#59745b]">
                  +
                </span>
              </button>
              <Link
                href="/projects"
                className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#edf0eb] p-4 text-left transition hover:border-[#dfe5dc] hover:bg-[#fafaf8]"
              >
                <div>
                  <strong className="block text-xs text-[#20251f]">
                    Upload meeting transcript
                  </strong>
                  <small className="text-[11px] text-[#7a8678]">
                    Generate structured MOM and action items
                  </small>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f5ee] text-xs font-bold text-[#59745b]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
