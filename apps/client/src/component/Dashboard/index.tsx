"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProject";
import { useMyIntegrations } from "@/hooks/useIntegration";
import CreateProjectModal from "@/component/CreateProjectModal";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: integrations } = useMyIntegrations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute connected status from integrations and user flags
  const isJiraConnected = Boolean(
    user?.atlassian_connected ||
      integrations?.some((i) => (i as any).atlassian_cloud_id || (i as any).platform === "jira")
  );
  const isSlackConnected = Boolean(
    user?.slack_connected ||
      integrations?.some((i) => (i as any).slack_token || (i as any).platform === "slack")
  );
  const isCalendarConnected = Boolean(
    user?.calendar_connected ||
      integrations?.some((i) => (i as any).platform === "calendar")
  );

  const connectedCount = [isJiraConnected, isSlackConnected, isCalendarConnected].filter(Boolean).length;
  const projectCount = projects?.length ?? 0;
  const recentProjects = projects?.slice(0, 4) ?? [];

  return (
    <div className="workspace-page space-y-6">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#dfe5dc] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#59745b]">
              Command Center
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Welcome back{user?.user_name ? `, ${user.user_name}` : ""}.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#596257]">
            Your operational memory is indexed and ready to assist your workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] active:scale-[0.98]"
          >
            <span className="text-base leading-none">+</span>
            <span>New project</span>
          </button>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2.5 rounded-xl border border-[#dfe5dc] bg-white px-5 py-2.5 text-xs font-bold text-[#596257] shadow-xs transition hover:border-[#20251f]/30 hover:bg-[#fafaf8] hover:text-[#20251f]"
          >
            <span>Connected tools</span>
            <span className="rounded-full bg-[#f1f7ef] px-2 py-0.5 text-[10px] font-extrabold text-[#426347]">
              {connectedCount}/3
            </span>
          </Link>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-px overflow-hidden border border-[#dfe5dc] bg-[#dfe5dc] sm:grid-cols-3">
        <Link
          href="/projects"
          className="group bg-white p-4 transition hover:bg-[#f5f8f4]"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#59745b]">
            <span>Active Projects</span>
            <span className="text-base text-[#8a9587] transition group-hover:translate-x-1">→</span>
          </div>
          <strong className="mt-2 block text-2xl font-extrabold tracking-tight text-[#20251f]">
            {projectsLoading ? "…" : String(projectCount).padStart(2, "0")}
          </strong>
          <p className="mt-2 text-xs text-[#7a8678]">
            {projectCount === 0 ? "No active workspaces created" : "Operational projects indexed"}
          </p>
        </Link>

        <Link
          href="/integrations"
          className="group bg-white p-4 transition hover:bg-[#f5f8f4]"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#59745b]">
            <span>Connected Integrations</span>
            <span className="text-base text-[#8a9587] transition group-hover:translate-x-1">→</span>
          </div>
          <strong className="mt-2 block text-2xl font-extrabold tracking-tight text-[#20251f]">
            {String(connectedCount).padStart(2, "0")}<span className="text-xl font-normal text-[#8a9587]">/03</span>
          </strong>
          <p className="mt-2 text-xs text-[#7a8678]">
            {connectedCount > 0 ? "Jira, Slack, or Calendar linked" : "Connect Jira to automate follow-up"}
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
            Transcripts, structured MOMs, and human-approved action gates are active.
          </p>
        </div>
      </section>

      {/* Main Grid: Projects & Quick Actions */}
      <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: Recent Projects */}
        <div className="border border-[#dfe5dc] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0eb] px-4 py-3">
            <h2 className="text-xl font-bold tracking-tight text-[#20251f]">
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs font-bold uppercase tracking-wider text-[#59745b] transition hover:text-[#20251f]"
            >
              View all ({projectCount}) →
            </Link>
          </div>

          {projectsLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white p-7" />
              ))}
            </div>
          )}

          {!projectsLoading && recentProjects.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#cbd9c8] bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f8f2] text-xl text-[#59745b] shadow-xs">
                ▦
              </div>
              <h3 className="mt-4 text-base font-bold text-[#20251f]">No projects yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#667166]">
                Create your first project to start organizing transcripts, AI-extracted MOMs, and follow-through actions.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
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
                  className="group flex flex-col justify-between p-4 transition hover:bg-[#f8faf7]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf2e8] text-xs font-bold text-[#59745b] shadow-xs">
                        ▰
                      </span>
                      <span className="text-xs text-[#8a9587]">
                        {new Date(project.updated_at || project.created_at).toLocaleDateString()}
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
                    <span className="transition group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Integration Status & Workflows */}
        <div className="space-y-5">
          <div className="border border-[#dfe5dc] bg-white p-4">
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
              <div className="flex items-center justify-between rounded-2xl border border-[#edf0eb] p-3.5 bg-[#fafaf8]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3ff] font-bold text-[#3564a8] shadow-xs">
                    ◇
                  </span>
                  <div>
                    <strong className="block text-xs text-[#20251f]">Atlassian Jira</strong>
                    <small className="text-[11px] text-[#7a8678]">Issue creation & tracking</small>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isJiraConnected
                    ? "bg-[#eaf6ec] text-[#347146]"
                    : "bg-[#f5f7f4] text-[#8a9587]"
                }`}>
                  <i className={`h-1.5 w-1.5 rounded-full ${isJiraConnected ? "bg-[#16a34a]" : "bg-[#8a9587]"}`} />
                  {isJiraConnected ? "Connected" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#edf0eb] p-3.5 bg-[#fafaf8]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1e9] font-bold text-[#b5522c] shadow-xs">
                    #
                  </span>
                  <div>
                    <strong className="block text-xs text-[#20251f]">Slack</strong>
                    <small className="text-[11px] text-[#7a8678]">Channel message proposals</small>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isSlackConnected
                    ? "bg-[#eaf6ec] text-[#347146]"
                    : "bg-[#f5f7f4] text-[#8a9587]"
                }`}>
                  <i className={`h-1.5 w-1.5 rounded-full ${isSlackConnected ? "bg-[#16a34a]" : "bg-[#8a9587]"}`} />
                  {isSlackConnected ? "Connected" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#edf0eb] p-3.5 bg-[#fafaf8]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f8ef] font-bold text-[#2f7447] shadow-xs">
                    ◎
                  </span>
                  <div>
                    <strong className="block text-xs text-[#20251f]">Google Calendar</strong>
                    <small className="text-[11px] text-[#7a8678]">Meeting sync & events</small>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isCalendarConnected
                    ? "bg-[#eaf6ec] text-[#347146]"
                    : "bg-[#f5f7f4] text-[#8a9587]"
                }`}>
                  <i className={`h-1.5 w-1.5 rounded-full ${isCalendarConnected ? "bg-[#16a34a]" : "bg-[#8a9587]"}`} />
                  {isCalendarConnected ? "Connected" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dfe5dc] bg-white p-7 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-[#20251f]">Quick Workflows</h2>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#edf0eb] p-4 text-left transition hover:bg-[#fafaf8] hover:border-[#dfe5dc]"
              >
                <div>
                  <strong className="block text-xs text-[#20251f]">Create a new project</strong>
                  <small className="text-[11px] text-[#7a8678]">Organize meetings and context</small>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f5ee] text-xs font-bold text-[#59745b]">+</span>
              </button>
              <Link
                href="/projects"
                className="flex w-full items-center justify-between rounded-2xl border border-[#edf0eb] p-4 text-left transition hover:bg-[#fafaf8] hover:border-[#dfe5dc]"
              >
                <div>
                  <strong className="block text-xs text-[#20251f]">Upload meeting transcript</strong>
                  <small className="text-[11px] text-[#7a8678]">Generate structured MOM and action items</small>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f5ee] text-xs font-bold text-[#59745b]">→</span>
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
