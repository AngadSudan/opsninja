"use client";

import Link from "next/link";
import WorkspaceLayout from "@/component/WorkspaceLayout";
import { useMyIntegrations } from "@/hooks/useIntegration";
import { useProjects } from "@/hooks/useProject";
import type { Integration } from "@/types/api.types";

type WorkspaceSection = "projects" | "integrations";

const platforms: Array<{
  platform: Integration["platform"];
  label: string;
  symbol: string;
  color: string;
}> = [
  { platform: "jira", label: "Jira", symbol: "◇", color: "text-blue-600" },
  { platform: "slack", label: "Slack", symbol: "#", color: "text-purple-600" },
  {
    platform: "calendar",
    label: "Calendar",
    symbol: "◎",
    color: "text-green-600",
  },
];

function ProjectsSection() {
  const { data: projects, isLoading, isError } = useProjects();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#59745b]">
          Workspace Overview
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#20251f] sm:text-4xl">
              Projects & Vaults
            </h1>
            <p className="mt-1 text-sm text-[#596257]">
              Active project workspaces connected to your operational memory.
            </p>
          </div>
          <span className="rounded-full border border-[#dce6da] bg-[#f1f7ef] px-3.5 py-1 text-xs font-bold text-[#426347]">
            {projects?.length ?? 0} active
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#59745b]">
            Loading projects…
          </span>
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-700">
          Projects could not be loaded. Check your connection and try again.
        </div>
      )}
      {!isLoading && !isError && projects?.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#dfe5dc] bg-white p-12 text-center text-sm text-[#596257]">
          No projects found. Create a project to start capturing meeting memory.
        </div>
      )}
      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.project_id}
              href={`/project/${project.project_id}`}
              className="group rounded-3xl border border-[#dfe5dc] bg-white p-7 sm:p-8 shadow-xs transition hover:border-[#59745b] hover:shadow-md hover:shadow-[#59745b]/5"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf2e8] text-lg text-[#59745b] shadow-2xs transition group-hover:scale-105"
                  aria-hidden="true"
                >
                  ▰
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fafaf8] text-sm text-[#8a9587] transition group-hover:translate-x-1 group-hover:bg-[#20251f] group-hover:text-white">
                  →
                </span>
              </div>
              <h2 className="mt-6 text-xl font-bold tracking-tight text-[#20251f]">
                {project.name}
              </h2>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#596257]">
                {project.description || "No description provided."}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function IntegrationsSection() {
  const { data: integrations, isLoading, isError } = useMyIntegrations();
  const connected = new Set(
    (integrations ?? [])
      .filter((item) => item.connected)
      .map((item) => item.platform),
  );

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#59745b]">
          Workspace Setup
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#20251f] sm:text-4xl">
          Connected Tools
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#596257]">
          External platforms authorized for bi-directional operational sync and approval gates.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#59745b]">
            Loading integrations…
          </span>
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-700">
          Integrations could not be loaded. Check your connection and try again.
        </div>
      )}
      {!isLoading && !isError && (
        <div className="grid gap-6 md:grid-cols-3">
          {platforms.map(({ platform, label, symbol, color }) => {
            const isConnected = connected.has(platform);
            return (
              <article
                key={platform}
                className="rounded-3xl border border-[#dfe5dc] bg-white p-7 sm:p-8 shadow-xs"
              >
                <span className={`text-3xl ${color}`} aria-hidden="true">
                  {symbol}
                </span>
                <h2 className="mt-5 text-lg font-bold text-[#20251f]">
                  {label}
                </h2>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`h-2 w-2 rounded-full ${isConnected ? "bg-[#16a34a] animate-pulse" : "bg-[#8a9587]"}`}
                  />
                  <span className={isConnected ? "text-[#347146] font-bold" : "text-[#8a9587]"}>
                    {isConnected ? "Connected & Active" : "Not connected"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function WorkspacePage({
  section,
}: {
  section?: WorkspaceSection;
}) {
  const activeSection = section ?? "projects";

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-12">
        {activeSection === "projects" ? (
          <ProjectsSection />
        ) : (
          <IntegrationsSection />
        )}
      </div>
    </WorkspaceLayout>
  );
}
