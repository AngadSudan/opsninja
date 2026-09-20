"use client";

import Link from "next/link";
import GetStartedButton from "@/component/GetStartedButton";
import BrandLogo from "@/component/BrandLogo";

export default function AboutPage() {
  const pillars = [
    {
      num: "01",
      title: "Keep the Signal",
      desc: "Decisions, dependencies, and commitments are distilled into an editable, high-density meeting record, never buried in unreadable 50-page raw transcripts.",
      tag: "Memory & Structure",
      highlight: "Structured MOMs",
    },
    {
      num: "02",
      title: "Connect the Context",
      desc: "Meeting intelligence is mapped into linked Obsidian knowledge graphs and indexed project memory so future architecture decisions rest on solid historical foundations.",
      tag: "Project Knowledge",
      highlight: "Bidirectional Graph",
    },
    {
      num: "03",
      title: "Protect the Handoff",
      desc: "Every external write to Jira, Slack, or GitHub is an inspectable, staged payload. An authorized human must review and approve it before execution leaves the vault.",
      tag: "Approval Gate",
      highlight: "Zero Blind Writes",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#f5f2ec] text-[#1c1b17] selection:bg-[#c3562c]/20 selection:text-[#1c1b17]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#1c1b17]/10 bg-[#fffdfa]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 transition">
            <BrandLogo className="h-9 w-9" priority />
            <span className="text-base font-extrabold tracking-tight text-[#1c1b17]">
              Ops Ninja
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-[#706a60]">
            <Link href="/" className="hover:text-[#1c1b17] transition">
              Overview
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#1c1b17] transition">
              Privacy
            </Link>
            <GetStartedButton variant="small" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-14 text-center lg:px-10 lg:pt-22">
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1c1b17] sm:text-5xl lg:text-6xl lg:leading-[1.06]">
          Meeting records should become trusted operational infrastructure.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#5f584f] sm:text-lg">
          Ops Ninja turns discussions into reviewed decisions, staged actions,
          persistent project knowledge, and grounded answers with provenance.
          The system is intentionally human-in-the-loop: external work never leaves
          the vault without inspection.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <GetStartedButton variant="large" />
        </div>
      </section>

      {/* 3 Pillars Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.num}
              className="group relative flex flex-col rounded-lg border border-[#ddd5c9] bg-[#fffdfa] p-8 transition hover:border-[#c3562c]/45"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-[#c3562c]">
                  {pillar.num}
                </span>
                <span className="rounded-md border border-[#ddd5c9] bg-[#f8f6f1] px-2.5 py-1 text-[11px] font-bold text-[#706a60]">
                  {pillar.tag}
                </span>
              </div>
              <h2 className="mt-6 text-xl font-bold text-[#1c1b17]">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5f584f]">
                {pillar.desc}
              </p>
              <div className="mt-auto pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3f1e]">
                  <span>{pillar.highlight}</span>
                  <span>→</span>
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Operational Philosophy Banner */}
        <div className="relative mt-14 overflow-hidden rounded-lg bg-[#121615] p-8 text-center text-white shadow-xl sm:p-14">
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#b7d0b7]">
              Deliberate By Design
            </span>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              No blind automations. No ghost tickets.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#c6d1c4]">
              Every Jira ticket, Slack announcement, and meeting action item passes
              through your approval gate first. You retain the cryptographic key
              to what leaves your operational vault.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-xs font-bold text-[#20251f] shadow-lg transition hover:bg-[#fafaf8]"
              >
                <span>Explore the approval gate demo</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dfe5dc] bg-[#fafaf8] px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#7a8678]">
          <div className="flex items-center gap-2.5">
              <BrandLogo className="h-5 w-5" />
            <span className="font-bold text-[#1c1b17]">Ops Ninja</span>
            <span>— The Human-in-the-Loop Operational Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#20251f]">
              Home
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#20251f]">
              Privacy
            </Link>
            <Link href="/home" className="hover:text-[#20251f]">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
