"use client";

import Link from "next/link";
import GetStartedButton from "@/component/GetStartedButton";
import BrandLogo from "@/component/BrandLogo";

const workflow = [
  {
    label: "Meeting",
    detail: "Architecture review transcript",
  },
  {
    label: "Decision",
    detail: "API migration approved",
  },
  {
    label: "Action",
    detail: "Create Jira migration ticket",
  },
  {
    label: "Human approval",
    detail: "Priya Menon reviews payload",
  },
  {
    label: "Jira / Slack",
    detail: "External work is dispatched",
  },
];

const proof = [
  ["Approval", "External writes wait for human review."],
  ["Provenance", "Answers stay linked to meetings, decisions, and actions."],
  ["Memory", "Project context persists across future work."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--page)]/92 backdrop-blur-xl">
        <div className="editorial-page flex min-h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8" priority />
            <span className="text-sm font-bold tracking-tight">Ops Ninja</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--ink-2)] md:flex" aria-label="Landing">
            <a href="#how-it-works" className="hover:text-[var(--ink)]">How it works</a>
            <a href="#approval" className="hover:text-[var(--ink)]">Approval</a>
            <a href="#integrations" className="hover:text-[var(--ink)]">Integrations</a>
            <Link href="/about" className="hover:text-[var(--ink)]">About</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="hidden min-h-11 items-center rounded-[5px] px-3 text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] sm:inline-flex"
            >
              Sign in
            </Link>
            <GetStartedButton variant="small" />
          </div>
        </div>
      </header>

      <main>
        <section className="editorial-page grid min-h-[calc(100svh-4rem)] items-center gap-12 py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.78fr)] lg:py-20">
          <div>
            <h1 className="max-w-4xl text-[clamp(3.1rem,8vw,7.4rem)] font-bold leading-[0.92] tracking-tight">
              Turn meetings into operational context.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--ink-2)]">
              Ops Ninja converts meeting transcripts into decisions, approved
              actions, and persistent project knowledge, with source evidence
              kept close to every answer.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <GetStartedButton variant="large" />
              <a href="#how-it-works" className="secondary-action">
                See the workflow
              </a>
            </div>
          </div>

          <div className="border-y border-[var(--line)] py-7">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
              <div>
                <p className="text-sm font-bold">Client meet</p>
                <p className="mt-1 text-sm text-[var(--ink-3)]">
                  3 meetings · 7 decisions · 12 actions
                </p>
              </div>
              <span className="status-text status-pending">Review required</span>
            </div>

            <ol className="divide-y divide-[var(--line)]">
              {workflow.map((item, index) => (
                <li key={item.label} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-5">
                  <span className={index === 3 ? "font-bold text-[var(--orange)]" : "font-bold text-[var(--ink-3)]"}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-bold">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-[var(--line)] bg-white">
          <div className="editorial-page grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              The product record becomes the interface.
            </h2>
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {proof.map(([title, body]) => (
                <div key={title} className="grid gap-3 py-6 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-sm leading-7 text-[var(--ink-2)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="approval" className="editorial-page py-20">
          <div className="grid gap-8 border-y border-[var(--line)] py-10 lg:grid-cols-[0.72fr_1.28fr]">
            <h2 className="text-3xl font-bold tracking-tight">Human approval is the boundary.</h2>
            <p className="max-w-3xl text-lg leading-8 text-[var(--ink-2)]">
              Ops Ninja can draft a Jira issue, prepare a Slack update, or
              preserve a knowledge change. The system keeps that work staged
              until a person verifies the payload and the source relationship.
            </p>
          </div>
        </section>

        <section id="integrations" className="border-t border-[var(--line)] bg-white">
          <div className="editorial-page py-16">
            <div className="grid divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-y-0">
              {["Jira", "Slack", "Notion"].map((name) => (
                <div key={name} className="p-6">
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-2)]">
                    {name === "Jira"
                      ? "Approved actions can create and update issues."
                      : name === "Slack"
                        ? "Approved decisions can post channel updates."
                        : "Knowledge changes can synchronize into a workspace."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="editorial-page flex flex-col gap-4 py-8 text-sm text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-5 w-5" />
            <span className="font-bold text-[var(--ink)]">Ops Ninja</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-[var(--ink)]">About</Link>
            <Link href="/integrations" className="hover:text-[var(--ink)]">Integrations</Link>
            <Link href="/home" className="hover:text-[var(--ink)]">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
