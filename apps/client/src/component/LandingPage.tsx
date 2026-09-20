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
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--page)]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-center px-6">
          <div className="flex w-full items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo className="h-8 w-8" priority />
              <span className="text-sm font-bold tracking-tight">
                Ops Ninja
              </span>
            </Link>

            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-semibold text-[var(--ink-2)] md:flex"
              aria-label="Landing"
            >
              <a
                href="#how-it-works"
                className="transition-colors hover:text-[var(--ink)]"
              >
                How it works
              </a>

              <a
                href="#approval"
                className="transition-colors hover:text-[var(--ink)]"
              >
                Approval
              </a>

              <a
                href="#integrations"
                className="transition-colors hover:text-[var(--ink)]"
              >
                Integrations
              </a>

              <Link
                href="/about"
                className="transition-colors hover:text-[var(--ink)]"
              >
                About
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="hidden min-h-11 items-center rounded-[5px] px-3 text-sm font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:inline-flex"
              >
                Sign in
              </Link>

              <GetStartedButton variant="small" />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
            <div className="flex max-w-5xl flex-col items-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
                Meeting intelligence for operations
              </p>

              <h1 className="mt-6 max-w-5xl text-[clamp(3.5rem,9vw,8.5rem)] font-bold leading-[0.88] tracking-[-0.06em]">
                Turn meetings
                <br />
                into operational
                <br />
                context.
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[var(--ink-2)] md:text-xl">
                Ops Ninja converts meeting transcripts into decisions, approved
                actions, and persistent project knowledge, with source evidence
                kept close to every answer.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <GetStartedButton variant="large" />

                <a
                  href="#how-it-works"
                  className="inline-flex min-h-12 items-center justify-center rounded-[5px] border border-[var(--line)] px-6 text-sm font-semibold transition-colors hover:bg-white"
                >
                  See the workflow
                </a>
              </div>
            </div>

            <div className="mx-auto mt-20 w-full max-w-3xl border-y border-[var(--line)] py-7 text-center">
              <div className="flex flex-col items-center justify-center border-b border-[var(--line)] pb-5">
                <p className="text-sm font-bold">Client meet</p>

                <p className="mt-1 text-sm text-[var(--ink-3)]">
                  3 meetings · 7 decisions · 12 actions
                </p>

                <span className="status-text status-pending mt-3">
                  Review required
                </span>
              </div>

              <ol className="divide-y divide-[var(--line)]">
                {workflow.map((item, index) => (
                  <li
                    key={item.label}
                    className="flex flex-col items-center justify-center gap-2 py-7"
                  >
                    <span
                      className={
                        index === 3
                          ? "font-bold text-[var(--orange)]"
                          : "font-bold text-[var(--ink-3)]"
                      }
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex flex-col items-center">
                      <p className="text-lg font-bold">{item.label}</p>

                      <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-[var(--line)] bg-white"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
              How it works
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              The product record becomes the interface.
            </h2>

            <div className="mt-16 w-full max-w-3xl divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {proof.map(([title, body]) => (
                <div
                  key={title}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <h3 className="text-lg font-bold">{title}</h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--ink-2)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="approval" className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
              Human approval
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Human approval is the boundary.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-2)]">
              Ops Ninja can draft a Jira issue, prepare a Slack update, or
              preserve a knowledge change. The system keeps that work staged
              until a person verifies the payload and the source relationship.
            </p>
          </div>
        </section>

        <section
          id="integrations"
          className="border-t border-[var(--line)] bg-white"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
              Integrations
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Connect the work you already use.
            </h2>

            <div className="mt-16 grid w-full max-w-4xl divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-y-0">
              {["Jira", "Slack", "Notion"].map((name) => (
                <div
                  key={name}
                  className="flex flex-col items-center p-8 text-center"
                >
                  <h3 className="text-xl font-bold">{name}</h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--ink-2)]">
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-5 px-6 py-10 text-center">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-5 w-5" />

            <span className="font-bold text-[var(--ink)]">Ops Ninja</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--ink-3)]">
            <Link href="/about" className="hover:text-[var(--ink)]">
              About
            </Link>

            <Link href="/integrations" className="hover:text-[var(--ink)]">
              Integrations
            </Link>

            <Link href="/home" className="hover:text-[var(--ink)]">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
