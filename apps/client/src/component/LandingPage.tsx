"use client";

import { useState } from "react";
import Link from "next/link";
import GetStartedButton from "@/component/GetStartedButton";

function BrandLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-sm"
      >
        <rect width="32" height="32" rx="9" fill="#20251f" />
        <path
          d="M8 22L16 10L24 22H8Z"
          fill="#59745b"
          fillOpacity="0.35"
        />
        <path
          d="M10 21L16 12L22 21H10Z"
          stroke="#b7d0b7"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18" r="2.2" fill="#16a34a" />
        <path
          d="M7 16H25"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
}

// Scenarios for the interactive live hero preview
interface DemoScenario {
  id: string;
  title: string;
  meetingName: string;
  duration: string;
  speakers: string;
  timestamp: string;
  transcriptSnippet: {
    speaker: string;
    role: string;
    text: string;
    highlight?: string;
  }[];
  extractedDecisions: string[];
  extractedActions: string[];
  targetTool: string;
  actionTitle: string;
  actionSummary: string;
  actionTag: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "sprint",
    title: "Sprint Planning",
    meetingName: "Core Platform • Sprint 48 Planning",
    duration: "42 min",
    speakers: "4 attendees",
    timestamp: "Today, 10:30 AM",
    transcriptSnippet: [
      {
        speaker: "Alex Rivera",
        role: "Staff Architect",
        text: "We need to finalize the DynamoDB partition keys before pushing the auth refactor to staging.",
        highlight: "finalize the DynamoDB partition keys",
      },
      {
        speaker: "Elena Rostova",
        role: "Product Lead",
        text: "Agreed. Let's gate this behind security signoff and track it in Jira under PROJ-Orca.",
        highlight: "gate this behind security signoff",
      },
    ],
    extractedDecisions: [
      "DynamoDB partition schema locked for User & Vault tables",
      "OAuth callback redirect loops eliminated from middleware",
    ],
    extractedActions: [
      "Alex to configure Cognito User Pool client attributes",
      "Stage Jira issue in ORCA for database migration index",
    ],
    targetTool: "Jira Software",
    actionTitle: "Create Jira Ticket: [ORCA-104] DynamoDB Partition Key Migration",
    actionSummary: "High priority task assigned to Core Platform team. Target release: v2.4 staging.",
    actionTag: "PROJ-ORCA #104",
  },
  {
    id: "architecture",
    title: "Architecture Review",
    meetingName: "Infra Sync • Event Bus Scalability",
    duration: "35 min",
    speakers: "3 attendees",
    timestamp: "Yesterday, 3:15 PM",
    transcriptSnippet: [
      {
        speaker: "Kenji Sato",
        role: "Principal SRE",
        text: "The SNS to SQS fanout latency spiked during last Friday's load test. We need dead-letter queues.",
        highlight: "SNS to SQS fanout latency spiked",
      },
      {
        speaker: "Maya Lin",
        role: "Backend Lead",
        text: "I'll create the Terraform PR today. Make sure we log an action to Obsidian operational memory.",
        highlight: "log an action to Obsidian operational memory",
      },
    ],
    extractedDecisions: [
      "Mandatory DLQ configured for all ingestion worker queues",
      "Obsidian knowledge vault updated with AWS architecture diagram",
    ],
    extractedActions: [
      "Maya to submit Terraform module for DLQ alarms",
      "Dispatch Slack alert to #eng-infra with latency SLO targets",
    ],
    targetTool: "Slack & Obsidian",
    actionTitle: "Post to #eng-infra & Link [[Architecture-DLQ-RFC]] in Vault",
    actionSummary: "Broadcast architectural decision and link meeting notes to team graph.",
    actionTag: "#ENG-INFRA",
  },
  {
    id: "incident",
    title: "Incident Postmortem",
    meetingName: "P1 Retrospective • Redis Cache Eviction",
    duration: "50 min",
    speakers: "5 attendees",
    timestamp: "Sep 18, 2:00 PM",
    transcriptSnippet: [
      {
        speaker: "David Kim",
        role: "DevOps Lead",
        text: "The root cause was volatile-lru eviction discarding active JWT session cache keys.",
        highlight: "volatile-lru eviction discarding active JWT session cache keys",
      },
      {
        speaker: "Sarah Vance",
        role: "VP Engineering",
        text: "Let's increase maxmemory and add an automated CloudWatch alarm before this Friday.",
        highlight: "add an automated CloudWatch alarm",
      },
    ],
    extractedDecisions: [
      "Session store migrated to isolated Redis cluster with noeviction policy",
      "Postmortem report approved for SOC-2 compliance log",
    ],
    extractedActions: [
      "Raise CloudWatch memory threshold alarm at 75%",
      "Schedule Jira remediation item for Friday deployment window",
    ],
    targetTool: "Jira & PagerDuty",
    actionTitle: "Create Jira Remediation: [OPS-892] Redis Memory Buffer & CloudWatch Alarm",
    actionSummary: "P1 follow-up action with SLA deadline of Friday 17:00 UTC.",
    actionTag: "INCIDENT-P1 #892",
  },
];

export default function LandingPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("sprint");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(true);
  const [actionApproved, setActionApproved] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const activeScenario =
    DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  const selectScenario = (id: string) => {
    setActiveScenarioId(id);
    setActionApproved(false);
    setIsApproving(false);
  };

  const handleApproveAction = () => {
    if (actionApproved || isApproving) return;
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setActionApproved(true);
    }, 450);
  };

  return (
    <div className="landing-shell relative min-h-screen bg-[#fafaf8] text-[#20251f] selection:bg-[#59745b]/20 selection:text-[#20251f]">
      {/* Ambient background glow decoration */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-[640px] w-[1200px] bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(89,116,91,0.12),rgba(250,250,248,0))]" />
      </div>

      {/* ── Fixed / Sticky Glass Navbar ───────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#20251f]/8 bg-[#fafaf8]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-3 transition"
          >
            <BrandLogo />
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-base font-extrabold tracking-tight text-[#20251f]">
                Ops Ninja
                <span className="rounded-md bg-[#59745b]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3d533f]">
                  v2.4
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#596257] md:flex">
            <a
              href="#how-it-works"
              className="transition hover:text-[#20251f]"
            >
              How It Works
            </a>
            <a
              href="#approval-gate"
              className="transition hover:text-[#20251f]"
            >
              The Approval Gate
            </a>
            <a
              href="#integrations"
              className="transition hover:text-[#20251f]"
            >
              Integrations
            </a>
            <a
              href="#security"
              className="transition hover:text-[#20251f]"
            >
              Vault Security
            </a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden px-3.5 py-2 text-xs font-semibold text-[#596257] transition hover:text-[#20251f] sm:inline-block"
            >
              Sign in
            </Link>
            <GetStartedButton variant="small" />
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-10 lg:pb-16 lg:pt-14">
        {/* Hero Copy & CTA */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#59745b]/25 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#3b4d3d] shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a34a] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16a34a]" />
            </span>
            <span>Autonomous Intelligence with Cryptographic Human Approval</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[#20251f] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            Operational memory for{" "}
            <span className="bg-gradient-to-r from-[#20251f] via-[#59745b] to-[#2d402f] bg-clip-text text-transparent">
              teams that ship.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base leading-relaxed text-[#596257] sm:text-lg">
            Capture the decisions behind the work, keep them connected to project
            context, and review every Jira or Slack action before it leaves Ops Ninja.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GetStartedButton variant="large" />
            <a
              href="#live-preview"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#20251f]/15 bg-white px-6 py-3.5 text-sm font-bold text-[#20251f] shadow-sm transition hover:border-[#20251f]/35 hover:bg-[#fafaf8]"
            >
              <span>Explore live simulator</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* Micro trust signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-[#7a8278]">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Zero blind automations
            </span>
            <span className="h-1 w-1 rounded-full bg-[#c6ccc2]" />
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Obsidian & Jira Native
            </span>
            <span className="h-1 w-1 rounded-full bg-[#c6ccc2]" />
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Local-first privacy
            </span>
          </div>
        </div>

        {/* ── Interactive Live Console Mockup ────────────────────── */}
        <div
          id="live-preview"
          className="mt-10 overflow-hidden rounded-lg border border-[#d6ded4] bg-[#edf2ea]/70 p-2 shadow-sm sm:p-3 lg:mt-12"
        >
          {/* Mock Window Shell */}
          <div className="rounded-md border border-[#d6ded4] bg-white shadow-none">
            {/* Window Titlebar */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#e5ebe3] bg-[#f7f9f6] px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#e87061]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#f4be48]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#62c554]/80" />
                </div>
                <span className="ml-3 hidden text-xs font-semibold text-[#596257] sm:inline">
                  {activeScenario.meetingName}
                </span>
              </div>

              {/* Scenario Switcher Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-[#e8eee6] p-1 text-xs">
                {DEMO_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => selectScenario(scenario.id)}
                    className={`rounded-lg px-3 py-1 font-semibold transition ${
                      activeScenarioId === scenario.id
                        ? "bg-white text-[#20251f] shadow-sm"
                        : "text-[#626d60] hover:text-[#20251f]"
                    }`}
                  >
                    {scenario.title}
                  </button>
                ))}
              </div>

              {/* Live Audio / Status Pill */}
              <div className="hidden items-center gap-2 rounded-full border border-[#16a34a]/30 bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-bold text-[#15803d] sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
                <span>ACTIVE VAULT</span>
              </div>
            </div>

            {/* Window Body Grid: 3 Live Columns */}
            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-3">
              {/* Column 1: Audio Transcript Ingestion */}
              <div className="flex flex-col rounded-xl border border-[#e5ebe3] bg-[#fbfcfb] p-4">
                <div className="flex items-center justify-between border-b border-[#edf2ec] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#59745b]">
                      01 • Audio Ingestion
                    </span>
                    <h3 className="text-xs font-bold text-[#20251f]">
                      Live Transcript Stream
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center gap-1 rounded-md border border-[#dfe5dc] bg-white px-2 py-1 text-[10px] font-semibold text-[#596257] hover:bg-[#f4f7f2]"
                  >
                    <span>{isPlayingAudio ? "⏸ Pause" : "▶ Play"}</span>
                  </button>
                </div>

                {/* Animated Audio Wave Simulation */}
                <div className="my-3 flex items-center justify-center gap-1 rounded-lg bg-[#eef3ec] px-3 py-2">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 50, 85, 35, 70, 95, 55, 65].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full bg-[#59745b] transition-all duration-300 ${
                        isPlayingAudio ? "animate-pulse" : "opacity-40"
                      }`}
                      style={{
                        height: isPlayingAudio ? `${Math.max(10, (h * (i % 3 + 1)) % 28 + 6)}px` : "6px",
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>

                {/* Dialogue stream cards */}
                <div className="mt-1 space-y-3">
                  {activeScenario.transcriptSnippet.map((line, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[#e8eee6] bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#20251f]">
                          {line.speaker}
                        </span>
                        <span className="text-[10px] font-medium text-[#7a8678]">
                          {line.role}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#596257]">
                        “{line.text}”
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-3 text-[11px] text-[#859283]">
                  <span>{activeScenario.duration} · {activeScenario.speakers}</span>
                </div>
              </div>

              {/* Column 2: AI Synthesis & Knowledge Graph */}
              <div className="flex flex-col rounded-xl border border-[#e5ebe3] bg-[#fbfcfb] p-4">
                <div className="border-b border-[#edf2ec] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">
                    02 • Signal Synthesis
                  </span>
                  <h3 className="text-xs font-bold text-[#20251f]">
                    Extracted Decisions & MOM
                  </h3>
                </div>

                {/* Decisions block */}
                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#3d533f]">
                    ✓ Locked Decisions
                  </p>
                  <div className="mt-2 space-y-2">
                    {activeScenario.extractedDecisions.map((decision, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg border border-[#e0ebd9] bg-[#f5f9f3] p-2.5 text-xs text-[#20251f]"
                      >
                        <span className="mt-0.5 text-[#16a34a] font-bold">✓</span>
                        <span className="leading-snug">{decision}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staged actions block */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#b15d3d]">
                    ⚡ Staged Proposals
                  </p>
                  <div className="mt-2 space-y-2">
                    {activeScenario.extractedActions.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg border border-[#faeade] bg-[#fff8f5] p-2.5 text-xs text-[#20251f]"
                      >
                        <span className="mt-0.5 text-[#c2491d] font-bold">→</span>
                        <span className="leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#edf2ec]">
                  <div className="flex items-center gap-2 text-[11px] text-[#59745b]">
                    <span>Linked to Obsidian Vault</span>
                    <span className="h-1 w-1 rounded-full bg-[#59745b]" />
                    <span className="font-mono text-[10px]">[[{activeScenario.id}.md]]</span>
                  </div>
                </div>
              </div>

              {/* Column 3: The Human Approval Gate */}
              <div className="flex flex-col rounded-xl border-2 border-[#20251f]/15 bg-[#20251f] p-4 text-white shadow-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]">
                      03 • Human Gate
                    </span>
                    <h3 className="text-xs font-bold text-white">
                      Cryptographic Execution
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[#e5ebe3]">
                    {activeScenario.targetTool}
                  </span>
                </div>

                {/* Staged Payload Card */}
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#c2491d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Action Staged
                    </span>
                    <span className="font-mono text-[10px] text-[#aeb9ac]">
                      {activeScenario.actionTag}
                    </span>
                  </div>

                  <h4 className="mt-2.5 text-sm font-bold text-white leading-snug">
                    {activeScenario.actionTitle}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-[#c6d1c4]">
                    {activeScenario.actionSummary}
                  </p>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px] text-[#9eaa9b]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b] animate-pulse" />
                    <span>Awaiting human sign-off before dispatch</span>
                  </div>
                </div>

                {/* Interactive Gate Trigger Button */}
                <div className="mt-auto pt-4">
                  {actionApproved ? (
                    <div className="flex items-center justify-between rounded-xl bg-[#16a34a] p-3 text-white shadow-lg animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                          ✓
                        </span>
                        <span>Dispatched to {activeScenario.targetTool}!</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActionApproved(false)}
                        className="text-[10px] underline hover:text-white/80"
                      >
                        Reset demo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApproveAction}
                      disabled={isApproving}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#59745b] to-[#405842] py-3 text-xs font-bold text-white shadow-lg transition hover:from-[#668468] hover:to-[#49654b] active:scale-[0.98] cursor-pointer"
                    >
                      {isApproving ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying & Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span>Approve & Execute Action</span>
                          <span className="transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  )}
                  <p className="mt-2 text-center text-[10px] text-[#8d9b8a]">
                    Click to test the live approval gate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Partner Integrations Bar ──────────────────────────── */}
        <div id="integrations" className="mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a8678]">
            Works natively with your engineering ecosystem
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { name: "Obsidian", badge: "Vault Sync" },
              { name: "Jira Software", badge: "Action Gate" },
              { name: "Slack", badge: "Alerts & Feeds" },
              { name: "Linear", badge: "Issue Tracker" },
              { name: "Google Meet", badge: "Audio Transcripts" },
              { name: "Zoom", badge: "Cloud Recordings" },
            ].map((tool) => (
              <div
                key={tool.name}
                className="group flex items-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-4 py-2.5 text-xs font-bold text-[#20251f] shadow-sm transition hover:-translate-y-0.5 hover:border-[#9db29b] hover:shadow-md"
              >
                <span>{tool.name}</span>
                <span className="rounded bg-[#f1f5ee] px-1.5 py-0.5 text-[10px] font-semibold text-[#59745b]">
                  {tool.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: A Closed Operational Loop ────────────────── */}
      <section
        id="how-it-works"
        className="border-y border-[#dfe5dc] bg-white px-6 py-14 lg:px-10 lg:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#59745b]">
              The Ops Ninja Engine
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#20251f] sm:text-4xl">
              A closed operational loop.
            </h2>
            <p className="mt-4 text-base text-[#596257]">
              Meetings are only as good as what happens after them. We turn 60
              minutes of talk into verified, accountable real-world outcomes.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden border border-[#dfe5dc] bg-[#dfe5dc] md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Capture the Record",
                description:
                  "Raw meeting transcripts become high-density, structured Minutes of the Meeting (MOM) with explicit decisions, risks, attendees, and timelines.",
                tag: "Zero Noise",
              },
              {
                step: "02",
                title: "Connect the Context",
                description:
                  "Meeting notes automatically index into your linked Obsidian markdown vault, creating persistent graph connections across teams, codebases, and projects.",
                tag: "Team Graph",
              },
              {
                step: "03",
                title: "Act with Intent",
                description:
                  "Our orchestrator drafts precision Jira tickets, Slack announcements, and PR reviews. No external API call is dispatched until a human confirms.",
                tag: "Human Gate",
              },
            ].map((card) => (
              <div
                key={card.step}
                className="group relative flex flex-col bg-[#fafaf8] p-5 transition hover:bg-[#f3f7f1]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#c2491d]">
                    {card.step}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#59745b] shadow-xs border border-[#dfe5dc]">
                    {card.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#20251f]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#596257]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: The Approval Gate (Why Ops Ninja is Different) ─ */}
      <section
        id="approval-gate"
        className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c2491d]/30 bg-[#fff5f2] px-3 py-1 text-xs font-bold text-[#c2491d]">
              <span>🛡️ Zero Hallucinated Writes</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#20251f] sm:text-4xl lg:text-5xl">
              AI can prepare the work.
              <br />
              <span className="text-[#59745b]">Only you can release it.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#596257] sm:text-lg">
              Generic AI meeting assistants trigger blind automations that pollute
              your Jira backlogs, confuse engineers, and write unintended changes.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#596257]">
              Ops Ninja introduces a cryptographic human checkpoint. Every
              proposed ticket, Slack broadcast, or code review is staged with full
              context, letting you review the exact diff in seconds before approval.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#dfe5dc] bg-white p-4">
                <strong className="block text-2xl font-bold text-[#20251f]">
                  100%
                </strong>
                <span className="text-xs text-[#626d60]">
                  Human verified external actions
                </span>
              </div>
              <div className="rounded-xl border border-[#dfe5dc] bg-white p-4">
                <strong className="block text-2xl font-bold text-[#20251f]">
                  &lt; 5 sec
                </strong>
                <span className="text-xs text-[#626d60]">
                  Single-click review turnaround
                </span>
              </div>
            </div>
          </div>

          {/* Gate Comparison Visual */}
          <div className="space-y-4">
            {/* The Old Way */}
            <div className="rounded-2xl border border-[#f5c6cb] bg-[#fff5f5] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b02a37]">
                <span>✕ The Blind Automation Trap</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#721c24]">
                Traditional bots automatically post unverified action items to
                Jira, creating duplicate tickets, missing context, and eroding team
                trust.
              </p>
            </div>

            {/* The Ops Ninja Way */}
            <div className="rounded-2xl border-2 border-[#16a34a]/30 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#16a34a]">
                  <span>✓ The Ops Ninja Gate Protocol</span>
                </div>
                <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                  Protected
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#20251f]">
                Actions are staged with exact payload inspection, team assignment,
                and source transcript provenance. You hold the execution key at all times.
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-[#edf2ec] pt-3 text-xs font-semibold text-[#59745b]">
                <span>Provenance traceable</span>
                <span>•</span>
                <span>Audit logged</span>
                <span>•</span>
                <span>Instant dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Security & Privacy ───────────────────────── */}
      <section
        id="security"
        className="border-t border-[#dfe5dc] bg-[#f2f6f0]/60 px-6 py-14 lg:px-10 lg:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#59745b]">
              Enterprise Integrity
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#20251f]">
              Your conversations never become someone else&apos;s model.
            </h2>
            <p className="mt-4 text-sm text-[#596257]">
              Ops Ninja adheres to strict data isolation protocols. Transcripts and
              MOMs remain under your organization&apos;s encryption boundaries.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Local-First Vaults",
                desc: "Obsidian sync writes directly to markdown files on your infrastructure.",
              },
              {
                title: "Zero Model Training",
                desc: "Your proprietary transcripts are never retained for third-party LLM training.",
              },
              {
                title: "OAuth 2.0 PKCE",
                desc: "Direct enterprise tokens for Atlassian Jira, Slack, and Cognito.",
              },
              {
                title: "Immutable Audits",
                desc: "Every approval is signed with user attribution and execution timestamp.",
              },
            ].map((sec, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#dfe5dc] bg-white p-5 shadow-xs"
              >
                <h3 className="text-sm font-bold text-[#20251f]">
                  {sec.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#626d60]">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call to Action Banner ──────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="relative overflow-hidden rounded-lg bg-[#20251f] px-8 py-12 text-center text-white shadow-none sm:px-16 sm:py-16">
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#b7d0b7]">
              Get started in seconds
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Turn meeting chaos into decisive operational velocity.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-[#c6d1c4] sm:text-base">
              Experience meeting intelligence where AI prepares the work and you
              retain complete control over every real-world action.
            </p>
            <div className="mt-10 flex justify-center">
              <GetStartedButton variant="white" />
            </div>
            <p className="mt-4 text-xs text-[#8d9b8a]">
              Instant setup · Works with your existing Jira & Obsidian setup
            </p>
          </div>

          {/* Background decorative glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#59745b]/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-[#c2491d]/20 blur-3xl"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ── Comprehensive Modern Footer ───────────────────────── */}
      <footer className="border-t border-[#dfe5dc] bg-[#fafaf8] px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-6 w-6" />
              <span className="text-base font-bold tracking-tight text-[#20251f]">
                Ops Ninja
              </span>
              <span className="text-xs text-[#7a8678]">
                — Operational clarity, one approved action at a time.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#596257]">
              <Link href="/about" className="hover:text-[#20251f]">
                About
              </Link>
              <Link href="/privacy-policy" className="hover:text-[#20251f]">
                Privacy Policy
              </Link>
              <Link href="/offline" className="hover:text-[#20251f]">
                Offline Mode
              </Link>
              <span className="flex items-center gap-1.5 text-[#16a34a]">
                <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                All systems operational
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-[#edf2ec] pt-6 text-xs text-[#8d988c] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>© {new Date().getFullYear()} Ops Ninja Inc. All rights reserved.</span>
            <span>Local-first · Human Gate · Zero Blind Writes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
