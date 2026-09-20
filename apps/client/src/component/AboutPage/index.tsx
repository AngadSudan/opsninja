"use client";

import Link from "next/link";
import GetStartedButton from "@/component/GetStartedButton";
import BrandLogo from "@/component/BrandLogo";

const sections = [
  {
    title: "Problem",
    body: "Operational memory is scattered across transcripts, chat threads, issue trackers, and private notes. Teams lose the reason behind decisions before the work is finished.",
  },
  {
    title: "Approach",
    body: "Ops Ninja turns each meeting into a structured record: summary, decisions, actions, knowledge changes, pending approvals, and source evidence.",
  },
  {
    title: "Human approval",
    body: "External work stays staged until a person verifies the action, destination, and provenance. The system does not create blind tickets or messages.",
  },
  {
    title: "Persistent context",
    body: "Project intelligence remains available across future meetings and chat threads, so every answer can point back to the record that supports it.",
  },
  {
    title: "Execution",
    body: "Approved actions can move into Jira, Slack, and other operational tools without separating the task from the meeting evidence that created it.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--page)]/92 backdrop-blur-xl">
        <div className="editorial-page flex min-h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo className="h-20 w-20" priority />
            <span className="text-sm font-bold tracking-tight">Ops Ninja</span>
          </Link>
          <div className="flex items-center gap-5 text-sm font-semibold text-[var(--ink-2)]">
            <Link href="/" className="hover:text-[var(--ink)]">
              Home
            </Link>
            <Link
              href="/integrations"
              className="hidden hover:text-[var(--ink)] sm:inline"
            >
              Integrations
            </Link>
            <GetStartedButton variant="small" />
          </div>
        </div>
      </header>

      <main>
        <section className="editorial-page grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <h1 className="max-w-3xl text-[clamp(3rem,7vw,6.6rem)] font-bold leading-[0.94] tracking-tight">
            Work should remember why it exists.
          </h1>
          <div className="self-end border-t border-[var(--line)] pt-6">
            <p className="max-w-2xl text-xl leading-9 text-[var(--ink-2)]">
              Ops Ninja is a project intelligence workspace for teams that need
              meeting outcomes to become reviewed decisions, durable context,
              and traceable execution.
            </p>
          </div>
        </section>

        <section className="border-t border-[var(--line)] bg-white">
          <div className="editorial-page py-16">
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="grid gap-6 py-8 md:grid-cols-[6rem_14rem_minmax(0,1fr)]"
                >
                  <span
                    className={
                      index === 2
                        ? "font-bold text-[var(--orange)]"
                        : "font-bold text-[var(--ink-3)]"
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="max-w-3xl text-base leading-8 text-[var(--ink-2)]">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="editorial-page flex flex-col gap-4 py-8 text-sm text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <span>Ops Ninja</span>
          <Link
            href="/home"
            className="font-semibold text-[var(--ink)] hover:text-[var(--orange-dark)]"
          >
            Open workspace
          </Link>
        </div>
      </footer>
    </div>
  );
}
