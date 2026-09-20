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
  const recentProjects = projects?.slice(0, 5) ?? [];

  return (
    <div className="workspace-page">
      <section className="grid gap-10 border-b border-[var(--line)] pb-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-3)]">Home</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-tight tracking-tight">
            Welcome back{user?.user_name ? `, ${user.user_name}` : ""}.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--ink-2)]">
            Review project work, open recent meeting records, and keep external
            execution behind approval.
          </p>
        </div>
        <div className="self-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="primary-action w-full sm:w-auto"
          >
            New project
          </button>
        </div>
      </section>

      <section className="grid gap-px border-b border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
        <Link href="/projects" className="bg-[var(--page)] py-6 pr-6 hover:bg-white">
          <p className="text-sm font-semibold text-[var(--ink-3)]">Projects</p>
          <p className="mt-3 text-4xl font-bold">{projectsLoading ? "…" : projectCount}</p>
        </Link>
        <Link href="/integrations" className="bg-[var(--page)] px-6 py-6 hover:bg-white">
          <p className="text-sm font-semibold text-[var(--ink-3)]">Integrations</p>
          <p className="mt-3 text-4xl font-bold">
            {connectedCount}<span className="text-2xl text-[var(--ink-3)]">/3</span>
          </p>
        </Link>
        <div className="bg-[var(--page)] py-6 pl-6">
          <p className="text-sm font-semibold text-[var(--ink-3)]">Approval</p>
          <p className="mt-4 status-text status-pending">Human review required</p>
        </div>
      </section>

      <section className="grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent projects</h2>
              <p className="mt-1 text-sm text-[var(--ink-3)]">
                Latest operational workspaces.
              </p>
            </div>
            <Link href="/projects" className="text-sm font-bold text-[var(--orange-dark)]">
              View all
            </Link>
          </div>

          {projectsLoading && (
            <div className="divide-y divide-[var(--line)]">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse bg-white/55" />
              ))}
            </div>
          )}

          {!projectsLoading && recentProjects.length === 0 && (
            <div className="border-b border-[var(--line)] py-10">
              <h3 className="text-xl font-bold">No projects yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--ink-2)]">
                Create a project to organize transcripts, decisions, actions,
                and project conversations.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="primary-action mt-6"
              >
                Create first project
              </button>
            </div>
          )}

          {!projectsLoading && recentProjects.length > 0 && (
            <div className="divide-y divide-[var(--line)]">
              {recentProjects.map((project) => (
                <Link
                  key={project.project_id}
                  href={`/project/${project.project_id}`}
                  className="grid gap-4 py-5 hover:bg-white sm:grid-cols-[minmax(0,1fr)_9rem]"
                >
                  <div>
                    <h3 className="text-lg font-bold">{project.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--ink-2)]">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--ink-3)] sm:text-right">
                    {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside>
          <h2 className="border-b border-[var(--line)] pb-4 text-2xl font-bold tracking-tight">
            Connected tools
          </h2>
          <div className="divide-y divide-[var(--line)]">
            {[
              ["Jira", isJiraConnected, "Issue creation and updates"],
              ["Slack", isSlackConnected, "Approved channel updates"],
              ["Calendar", isCalendarConnected, "Meeting synchronization"],
            ].map(([name, connected, description]) => (
              <div key={String(name)} className="py-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold">{name}</h3>
                  <span className={`status-text ${connected ? "status-success" : "status-muted"}`}>
                    {connected ? "Connected" : "Connect"}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">{description}</p>
              </div>
            ))}
          </div>
          <Link href="/integrations" className="secondary-action mt-4 w-full">
            Manage integrations
          </Link>
        </aside>
      </section>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
