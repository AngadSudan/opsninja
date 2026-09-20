"use client";

import type React from "react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/component/BrandLogo";
import {
  graphNodes,
  meeting,
  proposals as initialProposals,
  type ActionProposal,
  type GraphNode,
} from "@/types/ops-ninja";

type View = "dashboard" | "meeting" | "approvals" | "graph" | "orchestrator";
type IconName =
  | "grid"
  | "note"
  | "shield"
  | "graph"
  | "chat"
  | "search"
  | "spark"
  | "jira"
  | "slack"
  | "check"
  | "close"
  | "arrow"
  | "more"
  | "edit"
  | "calendar"
  | "person"
  | "send"
  | "folder";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    note: (
      <>
        <path d="M5 3h10l4 4v14H5z" />
        <path d="M15 3v5h5M8 12h8M8 16h6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    graph: (
      <>
        <circle cx="5" cy="7" r="2" />
        <circle cx="18" cy="5" r="2" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="17" r="2" />
        <path d="m7 7 9-2M7 9l9 7M8 17h7" />
      </>
    ),
    chat: (
      <>
        <path d="M20 15a4 4 0 0 1-4 4H9l-5 3v-7a4 4 0 0 1-2-3.5v-5A4 4 0 0 1 6 3h10a4 4 0 0 1 4 4z" />
        <path d="M7 11h.01M12 11h.01M17 11h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    spark: (
      <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7zM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" />
    ),
    jira: <path d="m12 3 5 5-5 5-5-5zM17 8l3 3-5 5-3-3M7 13l3 3-3 3-3-3" />,
    slack: (
      <>
        <path d="M8 13a2 2 0 1 1-2-2V7a2 2 0 1 1 4 0v4" />
        <path d="M11 8a2 2 0 1 1 2-2h4a2 2 0 1 1 0 4h-4" />
        <path d="M16 11a2 2 0 1 1 2 2v4a2 2 0 1 1-4 0v-4" />
        <path d="M13 16a2 2 0 1 1-2 2H7a2 2 0 1 1 0-4h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z" />
        <path d="m13.5 6.5 3 3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6" />
      </>
    ),
    send: <path d="m3 4 18 8-18 8 3-8zM6 12h15" />,
    folder: <path d="M3 6h7l2 2h9v12H3z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
function Tag({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "orange" | "slate" | "green";
}) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}
function StatusDot({ tone = "blue" }: { tone?: "blue" | "orange" | "green" }) {
  return <span className={`status-dot status-${tone}`} />;
}

const navigation: Array<{ view: View; label: string; icon: IconName }> = [
  { view: "dashboard", label: "Command center", icon: "grid" },
  { view: "meeting", label: "Meeting records", icon: "note" },
  { view: "approvals", label: "Approval queue", icon: "shield" },
  { view: "graph", label: "Knowledge graph", icon: "graph" },
  { view: "orchestrator", label: "Ask Ops Ninja", icon: "chat" },
];
function Header({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="workspace-header">
      <div>
        <p className="section-path">WORKSPACE / {title.toUpperCase()}</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        {children}
        <button className="icon-button" aria-label="Search">
          <Icon name="search" />
        </button>
        <button className="avatar" aria-label="User profile">
          AR
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  setView,
  pending,
}: {
  setView: (view: View) => void;
  pending: ActionProposal[];
}) {
  return (
    <>
      <Header title="Command center">
        <button
          className="button button-primary small"
          onClick={() => setView("orchestrator")}
        >
          <Icon name="spark" size={15} /> Ask Ops Ninja
        </button>
      </Header>
      <main className="workspace-content dashboard-content">
        <section className="command-intro">
          <div>
            <p className="eyebrow">
              <span className="signal" /> Workspace signal
            </p>
            <h2>
              Good morning, Arjun.
              <br />
              <span>Your meeting memory is up to date.</span>
            </h2>
          </div>
          <div className="system-health">
            <span>
              <StatusDot tone="green" /> All systems connected
            </span>
            <p>Vault, Jira, and Slack are ready</p>
          </div>
        </section>
        <section className="metric-row">
          <button onClick={() => setView("meeting")}>
            <span>New meeting record</span>
            <strong>01</strong>
            <small>
              Ready for your review <Icon name="arrow" size={14} />
            </small>
          </button>
          <button
            className="attention-metric"
            onClick={() => setView("approvals")}
          >
            <span>Needs approval</span>
            <strong>{pending.length.toString().padStart(2, "0")}</strong>
            <small>
              External actions waiting <Icon name="arrow" size={14} />
            </small>
          </button>
          <button onClick={() => setView("graph")}>
            <span>Linked knowledge</span>
            <strong>18</strong>
            <small>
              Notes added this week <Icon name="arrow" size={14} />
            </small>
          </button>
        </section>
        <section className="dashboard-grid">
          <div className="panel meeting-brief">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Latest intelligence</p>
                <h3>Project Orca sprint planning</h3>
              </div>
              <button className="icon-button" aria-label="More options">
                <Icon name="more" />
              </button>
            </div>
            <div className="brief-meta">
              <span>
                <Icon name="calendar" size={14} /> Sep 12 · 46 min
              </span>
              <span>
                <Icon name="person" size={14} /> 4 participants
              </span>
              <Tag>AI structured</Tag>
            </div>
            <p className="brief-copy">
              Bluewave confirmed the October 18 release target. The first
              release centers on exception visibility, ownership, and daily
              reporting.
            </p>
            <div className="decision-strip">
              <span>Key decision</span>
              <p>Advanced analytics moves to a later release.</p>
            </div>
            <button className="text-action" onClick={() => setView("meeting")}>
              Review meeting record <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="panel approval-snapshot">
            <div className="panel-head">
              <div>
                <p className="eyebrow orange-eyebrow">
                  Human decision required
                </p>
                <h3>Approval queue</h3>
              </div>
              <Tag tone="orange">{pending.length} pending</Tag>
            </div>
            {pending.slice(0, 2).map((proposal) => (
              <button
                className="approval-mini"
                onClick={() => setView("approvals")}
                key={proposal.id}
              >
                <span className={`integration-icon ${proposal.type}`}>
                  <Icon name={proposal.type} size={16} />
                </span>
                <span>
                  <b>
                    {proposal.type === "jira"
                      ? "Create Jira issue"
                      : "Send Slack message"}
                  </b>
                  <small>{proposal.title}</small>
                </span>
                <Icon name="arrow" size={15} />
              </button>
            ))}
            <button
              className="text-action orange-action"
              onClick={() => setView("approvals")}
            >
              Open approval queue <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="panel action-list">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Execution ledger</p>
                <h3>Action items</h3>
              </div>
              <button className="plain-link">View all</button>
            </div>
            {meeting.actionItems.map((action) => (
              <div className="action-row" key={action.id}>
                <span className={`action-check ${action.status}`}>
                  <Icon
                    name={action.status === "complete" ? "check" : "arrow"}
                    size={12}
                  />
                </span>
                <div>
                  <b>{action.title}</b>
                  <small>
                    {action.assignee} · due {action.dueDate}
                  </small>
                </div>
                <Tag tone={action.priority === "urgent" ? "orange" : "slate"}>
                  {action.priority}
                </Tag>
              </div>
            ))}
          </div>
          <button
            className="panel graph-teaser"
            onClick={() => setView("graph")}
          >
            <div>
              <p className="eyebrow">Connected context</p>
              <h3>Explore the knowledge graph</h3>
              <p>
                Trace every decision through people, projects, and external
                outcomes.
              </p>
              <span className="text-action">
                Open graph <Icon name="arrow" size={15} />
              </span>
            </div>
            <div className="mini-network">
              <i />
              <i />
              <i />
              <i />
              <i />
              <em />
              <em />
              <em />
            </div>
          </button>
        </section>
      </main>
    </>
  );
}

function MeetingReview() {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(meeting.summary);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Header title="Meeting review">
        <button
          className="button button-quiet small"
          onClick={() => setEditing(!editing)}
        >
          <Icon name="edit" size={15} /> {editing ? "Stop editing" : "Edit MOM"}
        </button>
        <button
          className="button button-primary small"
          onClick={() => {
            setSaved(true);
            setEditing(false);
          }}
        >
          {saved ? "Saved" : "Save changes"}
        </button>
      </Header>
      <main className="workspace-content review-layout">
        <article className="meeting-document">
          <div className="document-heading">
            <div>
              <p className="eyebrow">
                <span className="ai-mini">✦</span> AI-generated meeting note
              </p>
              <h2>{meeting.title}</h2>
              <p>{meeting.date} · Microsoft Teams</p>
            </div>
            <Tag tone="green">
              <StatusDot tone="green" /> Saved to vault
            </Tag>
          </div>
          <div className="participant-row">
            <span>Participants</span>
            {meeting.participants.map((person, index) => (
              <div className="participant" key={person}>
                <i>
                  {person
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </i>
                {index < 2 ? person : `+${meeting.participants.length - 2}`}
              </div>
            ))}
          </div>
          <section className="document-section">
            <h3>Objective</h3>
            <p>{meeting.objective}</p>
          </section>
          <section className="document-section highlighted-section">
            <div className="section-with-label">
              <h3>Summary</h3>
              <span className="ai-label">AI draft</span>
            </div>
            {editing ? (
              <textarea
                aria-label="Meeting summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            ) : (
              <p>{summary}</p>
            )}
          </section>
          <div className="document-columns">
            <section className="document-section">
              <h3>Decisions</h3>
              <ul className="decision-list">
                {meeting.decisions.map((decision) => (
                  <li key={decision}>
                    <span>
                      <Icon name="check" size={13} />
                    </span>
                    {decision}
                  </li>
                ))}
              </ul>
            </section>
            <section className="document-section risks-section">
              <h3>Risks & dependencies</h3>
              <ul>
                {meeting.risksAndDependencies.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </section>
          </div>
          <section className="document-section">
            <div className="section-with-label">
              <h3>Action items</h3>
              <span>{meeting.actionItems.length} extracted</span>
            </div>
            <div className="document-actions">
              {meeting.actionItems.map((action) => (
                <div className="document-action" key={action.id}>
                  <span className={`action-check ${action.status}`}>
                    <Icon
                      name={action.status === "in_progress" ? "arrow" : "check"}
                      size={12}
                    />
                  </span>
                  <div>
                    <b>{action.title}</b>
                    <small>
                      {action.assignee} · due {action.dueDate}
                    </small>
                  </div>
                  {action.externalAction !== "none" && (
                    <span
                      className={`small-integration ${action.externalAction}`}
                    >
                      <Icon name={action.externalAction} size={13} />{" "}
                      {action.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="document-section">
            <h3>Next follow-up</h3>
            <div className="follow-up">
              <Icon name="calendar" size={17} />
              <div>
                <b>{meeting.followUp.date}</b>
                <p>{meeting.followUp.purpose}</p>
              </div>
            </div>
          </section>
        </article>
        <aside className="review-aside">
          <div className="aside-block">
            <p className="eyebrow">Vault relationships</p>
            <h3>Linked context</h3>
            {meeting.relatedTopics.map((topic) => (
              <button className="context-link" key={topic}>
                <span>
                  <Icon name="folder" size={14} />
                </span>
                {topic}
                <Icon name="arrow" size={13} />
              </button>
            ))}
          </div>
          <div className="aside-block trace-block">
            <p className="eyebrow">Source</p>
            <p>Generated from a 46-minute Microsoft Teams transcript.</p>
            <button className="plain-link">View transcript</button>
          </div>
        </aside>
      </main>
    </>
  );
}

function Approvals({
  proposals,
  setProposals,
}: {
  proposals: ActionProposal[];
  setProposals: React.Dispatch<React.SetStateAction<ActionProposal[]>>;
}) {
  const pending = proposals.filter((proposal) => proposal.status === "pending");
  const [selectedId, setSelectedId] = useState(
    pending[0]?.id ?? proposals[0]?.id,
  );
  const selected = proposals.find((proposal) => proposal.id === selectedId);
  const updateStatus = (status: "approved" | "rejected") => {
    if (selected)
      setProposals((items) =>
        items.map((item) =>
          item.id === selected.id ? { ...item, status } : item,
        ),
      );
  };
  return (
    <>
      <Header title="Approval queue">
        <div className="queue-count">
          <StatusDot tone="orange" /> {pending.length} awaiting your decision
        </div>
      </Header>
      <main className="workspace-content approval-layout">
        <aside className="queue-list">
          <div className="queue-list-head">
            <p>PROPOSED ACTIONS</p>
            <span>{pending.length}</span>
          </div>
          {proposals.map((proposal) => (
            <button
              className={`queue-item ${proposal.id === selectedId ? "selected" : ""}`}
              onClick={() => setSelectedId(proposal.id)}
              key={proposal.id}
            >
              <span className={`integration-icon ${proposal.type}`}>
                <Icon name={proposal.type} size={16} />
              </span>
              <span>
                <b>
                  {proposal.type === "jira"
                    ? "Create Jira issue"
                    : "Send Slack message"}
                </b>
                <small>{proposal.title}</small>
              </span>
              <Tag
                tone={
                  proposal.status === "pending"
                    ? "orange"
                    : proposal.status === "approved"
                      ? "green"
                      : "slate"
                }
              >
                {proposal.status}
              </Tag>
            </button>
          ))}
        </aside>
        {selected ? (
          <section className="approval-detail">
            <div className="approval-detail-top">
              <div>
                <p className="eyebrow orange-eyebrow">
                  External action proposal
                </p>
                <h2>
                  {selected.type === "jira"
                    ? "Create a Jira issue"
                    : "Send a Slack message"}
                </h2>
              </div>
              <span className={`proposal-status ${selected.status}`}>
                <StatusDot
                  tone={
                    selected.status === "pending"
                      ? "orange"
                      : selected.status === "approved"
                        ? "green"
                        : "blue"
                  }
                />{" "}
                {selected.status === "pending"
                  ? "Awaiting approval"
                  : selected.status === "approved"
                    ? "Approved"
                    : "Rejected"}
              </span>
            </div>
            <div className="approval-steps">
              <div>
                <span>1</span>
                <p>What triggered this</p>
                <strong>
                  Action item extracted from <b>{selected.sourceMeeting}</b>
                </strong>
              </div>
              <div>
                <span>2</span>
                <p>What Ops Ninja proposes</p>
                <strong>
                  {selected.type === "jira"
                    ? "Create one issue in the ORCA project"
                    : "Send one message to the delivery channel"}
                </strong>
              </div>
              <div>
                <span>3</span>
                <p>What will happen</p>
                <strong>
                  {selected.type === "jira"
                    ? "The issue and its link will be saved back to the vault"
                    : "The delivered message will be recorded in the vault"}
                </strong>
              </div>
            </div>
            <div className="proposal-payload">
              <div className="payload-head">
                <span className={`integration-icon ${selected.type}`}>
                  <Icon name={selected.type} size={17} />
                </span>
                <div>
                  <b>
                    {selected.type === "jira"
                      ? "Jira issue payload"
                      : "Slack message payload"}
                  </b>
                  <small>Destination: {selected.target}</small>
                </div>
              </div>
              <div className="payload-line">
                <span>Title</span>
                <p>{selected.title}</p>
              </div>
              {selected.assignee && (
                <div className="payload-line">
                  <span>Owner</span>
                  <p>{selected.assignee}</p>
                </div>
              )}
              <div className="payload-line payload-description">
                <span>Content</span>
                <p>{selected.description}</p>
              </div>
            </div>
            {selected.status === "pending" ? (
              <div className="approval-footer">
                <p>
                  <span>!</span> This will create an external record. Review the
                  destination and content before approving.
                </p>
                <div>
                  <button
                    className="button button-reject"
                    onClick={() => updateStatus("rejected")}
                  >
                    <Icon name="close" size={16} /> Reject
                  </button>
                  <button
                    className="button button-approve"
                    onClick={() => updateStatus("approved")}
                  >
                    <Icon name="check" size={16} /> Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className={`outcome-banner ${selected.status}`}>
                <Icon
                  name={selected.status === "approved" ? "check" : "close"}
                  size={17}
                />
                <span>
                  {selected.status === "approved"
                    ? "Approved. The external action is ready to execute and will be recorded in the vault."
                    : "Rejected. No external action will be taken."}
                </span>
              </div>
            )}
          </section>
        ) : (
          <section className="empty-panel">
            <Icon name="check" size={30} />
            <h2>Queue cleared</h2>
            <p>There are no external actions waiting for a decision.</p>
          </section>
        )}
      </main>
    </>
  );
}

const graphEdges = [
  ["orca", "meeting"],
  ["orca", "arjun"],
  ["orca", "drilldown"],
  ["meeting", "priya"],
  ["meeting", "credentials"],
  ["meeting", "vault"],
  ["priya", "credentials"],
  ["credentials", "slack"],
  ["arjun", "drilldown"],
  ["drilldown", "jira"],
  ["vault", "drilldown"],
];
function KnowledgeGraph() {
  const [selected, setSelected] = useState<GraphNode>(graphNodes[0]);
  const typeLabel: Record<GraphNode["type"], string> = {
    meeting: "Meeting",
    action: "Action item",
    person: "Person",
    project: "Project",
    jira: "Jira issue",
    slack: "Slack message",
    note: "Obsidian note",
  };
  return (
    <>
      <Header title="Knowledge graph">
        <button className="button button-quiet small">
          <Icon name="search" size={15} /> Find a record
        </button>
      </Header>
      <main className="workspace-content graph-layout">
        <section className="graph-stage">
          <div className="graph-topbar">
            <p>
              <span className="live-dot" /> {graphNodes.length} linked records
            </p>
            <div>
              <button aria-label="Zoom in">+</button>
              <button aria-label="Zoom out">−</button>
            </div>
          </div>
          <svg
            className="graph-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {graphEdges.map(([from, to]) => {
              const source = graphNodes.find((node) => node.id === from)!;
              const target = graphNodes.find((node) => node.id === to)!;
              return (
                <line
                  key={`${from}-${to}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                />
              );
            })}
          </svg>
          {graphNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelected(node)}
              className={`graph-node ${node.type} ${selected.id === node.id ? "active" : ""}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <i />
              <span>{node.label}</span>
            </button>
          ))}
          <div className="graph-key">
            {Object.entries(typeLabel)
              .slice(0, 5)
              .map(([type, label]) => (
                <span key={type}>
                  <i className={type} />
                  {label}
                </span>
              ))}
          </div>
        </section>
        <aside className="node-inspector">
          <p className="eyebrow">Selected record</p>
          <span className={`node-type-icon ${selected.type}`}>
            <Icon
              name={
                selected.type === "meeting"
                  ? "note"
                  : selected.type === "project"
                    ? "folder"
                    : selected.type === "action"
                      ? "check"
                      : selected.type === "person"
                        ? "person"
                        : selected.type
              }
              size={20}
            />
          </span>
          <Tag>{typeLabel[selected.type]}</Tag>
          <h2>{selected.label}</h2>
          <p>
            {selected.type === "project"
              ? "The operational workspace that connects this meeting, its actions, and released external records."
              : selected.type === "meeting"
                ? "A structured meeting note saved from the Project Orca planning transcript."
                : "A linked record in the Project Orca operational knowledge graph."}
          </p>
          <div className="inspector-stats">
            <span>
              <b>
                {graphEdges.filter((edge) => edge.includes(selected.id)).length}
              </b>{" "}
              relationships
            </span>
            <span>
              <b>Sep 12</b> last updated
            </span>
          </div>
          <button className="button button-quiet full">
            Open record <Icon name="arrow" size={15} />
          </button>
        </aside>
      </main>
    </>
  );
}

type Message = {
  sender: "user" | "assistant";
  text: string;
  proposal?: boolean;
};
function Orchestrator({ setView }: { setView: (view: View) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "I have the Project Orca meeting, its linked action notes, and your connected integrations in context. What would you like to know or prepare?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setMessages((items) => [...items, { sender: "user", text: message }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const isAction = /jira|slack|send|create/i.test(message);
      setMessages((items) => [
        ...items,
        {
          sender: "assistant",
          text: isAction
            ? "I found the linked action item. I prepared an external action, but it will not run until you approve it."
            : "The team agreed to keep the October 18 release target. The initial release prioritizes exception visibility, ownership assignment, and daily reporting; advanced analytics moved to a later release.",
          proposal: isAction,
        },
      ]);
      setThinking(false);
    }, 700);
  };
  return (
    <>
      <Header title="Ask Ops Ninja">
        <div className="orchestrator-state">
          <StatusDot tone={thinking ? "orange" : "green"} />{" "}
          {thinking ? "Checking connected context" : "Vault-aware"}
        </div>
      </Header>
      <main className="workspace-content chat-layout">
        <section className="chat-main">
          <div className="chat-intro">
            <span className="ninja-orb">
              <Icon name="spark" size={22} />
            </span>
            <h2>
              Your operational memory,
              <br />
              ready to reason with.
            </h2>
            <p>
              Ops Ninja retrieves only the context needed from your vault and
              connected tools.
            </p>
            <div className="suggestions">
              <button
                onClick={() =>
                  setInput("What decisions were made in yesterday's meeting?")
                }
              >
                What decisions were made in yesterday&apos;s meeting?
              </button>
              <button
                onClick={() =>
                  setInput(
                    "Create a Jira issue for the dashboard filters action.",
                  )
                }
              >
                Create a Jira issue for the dashboard filters action.
              </button>
            </div>
          </div>
          <div className="messages">
            {messages.map((message, index) => (
              <div
                className={`message ${message.sender}`}
                key={`${message.sender}-${index}`}
              >
                <span className="message-avatar">
                  {message.sender === "assistant" ? "✦" : "AR"}
                </span>
                <div>
                  {message.text}
                  {message.proposal && (
                    <button
                      className="chat-proposal"
                      onClick={() => setView("approvals")}
                    >
                      <span className="integration-icon jira">
                        <Icon name="jira" size={15} />
                      </span>
                      <span>
                        <b>Action proposal ready</b>
                        <small>Requires your approval before execution</small>
                      </span>
                      <Icon name="arrow" size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="message assistant">
                <span className="message-avatar">✦</span>
                <div className="thinking">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
          </div>
          <form className="chat-input" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a meeting, action, or connected tool..."
              aria-label="Message Ops Ninja"
            />
            <button
              className="button button-primary"
              type="submit"
              aria-label="Send message"
            >
              <Icon name="send" size={17} />
            </button>
          </form>
        </section>
        <aside className="chat-aside">
          <div>
            <p className="eyebrow">Context available</p>
            <h3>Project Orca</h3>
            <button>
              <Icon name="note" size={15} /> Sprint planning MOM{" "}
              <span>In vault</span>
            </button>
            <button>
              <Icon name="check" size={15} /> 3 linked action items{" "}
              <span>Current</span>
            </button>
          </div>
          <div className="tool-status">
            <p className="eyebrow">Connected tools</p>
            <span>
              <Icon name="folder" size={15} /> Obsidian <i />
            </span>
            <span>
              <Icon name="jira" size={15} /> Jira <i />
            </span>
            <span>
              <Icon name="slack" size={15} /> Slack <i />
            </span>
          </div>
        </aside>
      </main>
    </>
  );
}

export default function OpsNinjaApp() {
  const [view, setView] = useState<View>("dashboard");
  const [proposals, setProposals] = useState(initialProposals);
  const pending = proposals.filter((proposal) => proposal.status === "pending");
  return (
    <div className="ops-app">
      <aside className="workspace-sidebar">
        <Link href="/" className="workspace-brand">
          <BrandLogo className="h-8 w-8" />
          <span>Ops Ninja</span>
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-initial">B</span>
          <div>
            <b>Bluewave delivery</b>
            <small>Operational workspace</small>
          </div>
          <span>⌄</span>
        </div>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.view}
              className={view === item.view ? "active" : ""}
              onClick={() => setView(item.view)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.view === "approvals" && pending.length > 0 ? (
                <b className="nav-badge">{pending.length}</b>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="vault-status">
            <span>
              <StatusDot tone="green" /> Vault synced
            </span>
            <small>18 records indexed</small>
          </div>
          <Link href="/" className="back-link">
            ← Back to overview
          </Link>
        </div>
      </aside>
      <section className="workspace-main">
        {view === "dashboard" && (
          <Dashboard setView={setView} pending={pending} />
        )}
        {view === "meeting" && <MeetingReview />}
        {view === "approvals" && (
          <Approvals proposals={proposals} setProposals={setProposals} />
        )}
        {view === "graph" && <KnowledgeGraph />}
        {view === "orchestrator" && <Orchestrator setView={setView} />}
      </section>
    </div>
  );
}
