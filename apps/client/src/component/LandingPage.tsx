"use client";

import Link from "next/link";
import GetStartedButton from "@/component/GetStartedButton";
import BrandLogo from "@/component/BrandLogo";

const workflow = [
  {
    number: "01",
    label: "Meeting",
    detail: "Architecture review transcript",
  },
  {
    number: "02",
    label: "Decision",
    detail: "API migration approved",
  },
  {
    number: "03",
    label: "Action",
    detail: "Create Jira migration ticket",
  },
  {
    number: "04",
    label: "Human approval",
    detail: "Priya Menon reviews payload",
    active: true,
  },
  {
    number: "05",
    label: "Jira / Slack",
    detail: "External work is dispatched",
  },
];

const proof = [
  {
    number: "01",
    title: "Approval",
    body: "External writes wait for human review before anything reaches your connected tools.",
  },
  {
    number: "02",
    title: "Provenance",
    body: "Every answer stays connected to the meeting, decision, and action that created it.",
  },
  {
    number: "03",
    title: "Memory",
    body: "Project context persists across meetings so your team does not have to start from zero.",
  },
];

const integrations = [
  {
    name: "Jira",
    description: "Create and update approved issues.",
  },
  {
    name: "Slack",
    description: "Send approved decisions to channels.",
  },
  {
    name: "Notion",
    description: "Synchronize persistent project knowledge.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[var(--page)] text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--page)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-8 w-8" priority />
            <span className="text-sm font-bold tracking-tight">Ops Ninja</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium text-[var(--ink-2)] md:flex">
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
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:block"
            >
              Sign in
            </Link>

            <GetStartedButton variant="small" />
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center px-5 py-24 text-center sm:px-6 lg:py-32">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

          <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-[var(--ink-2)] shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange)]" />
              MEETING INTELLIGENCE FOR OPERATIONS
            </div>

            <h1 className="mt-8 max-w-5xl text-[clamp(3.6rem,9vw,8.8rem)] font-bold leading-[0.86] tracking-[-0.065em]">
              Turn meetings
              <br />
              into <span className="text-[var(--orange)]">context.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-[var(--ink-2)] sm:text-lg sm:leading-8">
              Ops Ninja converts meeting transcripts into decisions, approved
              actions, and persistent project knowledge — with source evidence
              kept close to every answer.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <GetStartedButton variant="large" />

              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--line)] bg-white px-6 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--ink-3)] hover:shadow-md"
              >
                Explore the workflow
              </a>
            </div>

            <div className="mt-16 flex items-center justify-center gap-6 text-xs text-[var(--ink-3)]">
              <span>Transcript → Decision</span>
              <span className="h-1 w-1 rounded-full bg-[var(--ink-3)]" />
              <span>Decision → Action</span>
              <span className="hidden h-1 w-1 rounded-full bg-[var(--ink-3)] sm:block" />
              <span className="hidden sm:block">Action → Approval</span>
            </div>

            <div className="relative mt-16 w-full max-w-4xl">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-[var(--orange)]/5 blur-3xl" />

              <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white text-left shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 sm:flex-row">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <span className="h-2 w-2 rounded-full bg-[var(--orange)]" />
                      <p className="text-sm font-bold">Client meet</p>
                    </div>

                    <p className="mt-1 text-xs text-[var(--ink-3)]">
                      3 meetings · 7 decisions · 12 actions
                    </p>
                  </div>

                  <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[var(--orange)]">
                    Review required
                  </span>
                </div>

                <div className="grid sm:grid-cols-5">
                  {workflow.map((item, index) => (
                    <div
                      key={item.label}
                      className={`relative flex min-h-40 flex-col items-center justify-center border-b border-[var(--line)] px-5 py-7 text-center transition-colors last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                        item.active
                          ? "bg-[var(--orange)]/[0.045]"
                          : "hover:bg-black/[0.015]"
                      }`}
                    >
                      {item.active && (
                        <div className="absolute left-1/2 top-0 h-0.5 w-10 -translate-x-1/2 bg-[var(--orange)]" />
                      )}

                      <span
                        className={`text-xs font-bold ${
                          item.active
                            ? "text-[var(--orange)]"
                            : "text-[var(--ink-3)]"
                        }`}
                      >
                        {item.number}
                      </span>

                      <p className="mt-4 text-sm font-bold">{item.label}</p>

                      <p className="mt-2 text-xs leading-5 text-[var(--ink-2)]">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-[var(--line)] bg-white"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-28 text-center sm:px-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
              How it works
            </span>

            <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl md:text-6xl">
              The product record becomes the interface.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--ink-2)]">
              Conversations become structured operational knowledge instead of
              disappearing into meeting history.
            </p>

            <div className="mt-16 grid w-full max-w-5xl border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-[var(--line)]">
              {proof.map((item) => (
                <div
                  key={item.number}
                  className="flex flex-col items-center px-8 py-10 text-center transition-colors hover:bg-black/[0.015]"
                >
                  <span className="text-xs font-bold text-[var(--orange)]">
                    {item.number}
                  </span>

                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>

                  <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--ink-2)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="approval" className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-28 text-center sm:px-6">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
                Human approval
              </span>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-5xl md:text-6xl">
                Automation stops where trust begins.
              </h2>

              <p className="mt-6 text-base leading-8 text-[var(--ink-2)] sm:text-lg">
                Ops Ninja can prepare Jira issues, Slack updates, and knowledge
                changes, but external work stays staged until a person verifies
                the payload and its source relationship.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <div className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-xs font-semibold shadow-sm">
                  AI prepares
                </div>

                <span className="text-[var(--ink-3)]">→</span>

                <div className="rounded-full border border-orange-200 bg-orange-50 px-5 py-2.5 text-xs font-semibold text-[var(--orange)]">
                  Human reviews
                </div>

                <span className="text-[var(--ink-3)]">→</span>

                <div className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-xs font-semibold shadow-sm">
                  System executes
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="integrations"
          className="border-t border-[var(--line)] bg-white"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-28 text-center sm:px-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
              Integrations
            </span>

            <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Your existing tools.
              <br />
              One operational layer.
            </h2>

            <div className="mt-16 grid w-full max-w-4xl border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-[var(--line)]">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="group flex flex-col items-center px-8 py-10 text-center transition-all hover:bg-black/[0.02]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--page)] text-sm font-bold shadow-sm transition-transform group-hover:-translate-y-1">
                    {integration.name.slice(0, 1)}
                  </div>

                  <h3 className="mt-5 text-lg font-bold">{integration.name}</h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--ink-2)]">
                    {integration.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-28 text-center sm:px-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
              Ops Ninja
            </span>

            <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl md:text-6xl">
              Make every meeting part of the system.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--ink-2)]">
              Capture what was decided, what needs to happen next, and why it
              happened — without losing the context behind it.
            </p>

            <div className="mt-9">
              <GetStartedButton variant="large" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-10 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-6 w-6" />
            <span className="text-sm font-bold">Ops Ninja</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--ink-3)]">
            <Link
              href="/about"
              className="transition-colors hover:text-[var(--ink)]"
            >
              About
            </Link>

            <Link
              href="/integrations"
              className="transition-colors hover:text-[var(--ink)]"
            >
              Integrations
            </Link>

            <Link
              href="/home"
              className="transition-colors hover:text-[var(--ink)]"
            >
              Workspace
            </Link>
          </div>

          <p className="text-xs text-[var(--ink-3)]">
            Operational context, without the operational noise.
          </p>
        </div>
      </footer>
    </div>
  );
}
