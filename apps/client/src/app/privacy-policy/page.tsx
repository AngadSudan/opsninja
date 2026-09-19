import Link from "next/link";

const sections = [
  {
    title: "Information we handle",
    content: (
      <>
        <p>
          Ops-Ninja is designed to turn meeting minutes into useful operational
          records. Depending on how you use the service, we may handle:
        </p>
        <ul>
          <li>Meeting minutes, summaries, decisions, risks, and action items.</li>
          <li>Project and workspace details needed to organize those records.</li>
          <li>Messages you send to the Ops-Ninja chatbot and its responses.</li>
          <li>Account and technical information needed to authenticate and operate the service.</li>
          <li>Information returned by connected services such as Jira, Slack, or Obsidian.</li>
        </ul>
      </>
    ),
  },
  {
    title: "How we use information",
    content: (
      <>
        <p>We use information to provide and improve the service, including to:</p>
        <ul>
          <li>Generate meeting summaries and extract decisions, risks, and commitments.</li>
          <li>Store and retrieve project knowledge for the Ops-Ninja chatbot.</li>
          <li>Carry out actions you request, such as creating Jira issues or sending Slack messages.</li>
          <li>Authenticate users, protect the service, troubleshoot problems, and maintain reliability.</li>
        </ul>
        <p>
          We do not sell your personal information. We use meeting and project
          content only to provide the features you request and to operate the
          service.
        </p>
      </>
    ),
  },
  {
    title: "Connected services",
    content: (
      <p>
        Ops-Ninja can work with services such as Jira, Slack, Obsidian, cloud
        storage, and identity providers. When you connect one of these services,
        Ops-Ninja may access or send information according to the permissions
        you grant and the action you request. Those services process information
        under their own privacy policies. You can revoke access through the
        connected service or your Ops-Ninja configuration.
      </p>
    ),
  },
  {
    title: "Retention and security",
    content: (
      <p>
        We retain information for as long as needed to provide the service,
        maintain your project history, meet legitimate operational needs, or
        comply with legal obligations. We use reasonable technical and
        organizational safeguards to protect information, but no method of
        transmission or storage is completely secure.
      </p>
    ),
  },
  {
    title: "Your choices",
    content: (
      <p>
        You may review or update information in your workspace, disconnect
        integrations, and request deletion of information associated with your
        account, subject to applicable law and operational requirements. To make
        a privacy request, contact the person or organization that provided you
        access to Ops-Ninja.
      </p>
    ),
  },
  {
    title: "Children and policy changes",
    content: (
      <>
        <p>
          Ops-Ninja is intended for workplace and project use and is not directed
          to children under 13. We may update this policy as the service changes.
          When we do, we will post the updated version on this page and revise
          the effective date.
        </p>
        <p>
          For privacy questions, please contact the person or organization that
          manages your Ops-Ninja workspace.
        </p>
      </>
    ),
  },
];

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

export const metadata = {
  title: "Privacy Policy | Ops Ninja",
  description: "How Ops Ninja handles meeting, project, and integration data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#fafaf8] text-[#20251f] selection:bg-[#59745b]/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#20251f]/8 bg-[#fafaf8]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 transition">
            <BrandLogo />
            <span className="text-base font-extrabold tracking-tight text-[#20251f]">
              Ops Ninja
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-[#596257]">
            <Link href="/" className="hover:text-[#20251f] transition">
              Overview
            </Link>
            <Link href="/about" className="hover:text-[#20251f] transition">
              About
            </Link>
            <Link
              href="/home"
              className="rounded-xl border border-[#dfe5dc] bg-white px-4 py-2 text-xs font-bold text-[#20251f] transition hover:border-[#9db29b] shadow-xs"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
        <header className="border-b border-[#20251f]/10 pb-12">
          <div className="grid gap-8 md:grid-cols-[1fr_240px] md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#b15d3d]">
                Trust and transparency
              </p>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xs leading-5 text-[#20251f]/65">
              Effective date
              <br />
              September 17, 2026
            </p>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#596257]">
            Ops Ninja helps teams turn meeting records into accountable work,
            shared knowledge, and follow-through. This policy explains what we
            handle when you use the service.
          </p>
        </header>

        <div className="grid gap-12 py-12 md:grid-cols-[180px_1fr] md:gap-20">
          <aside className="text-xs font-bold uppercase tracking-[0.16em] text-[#59745b]">
            <p>Guiding Principles</p>
            <div className="mt-3 h-0.5 w-12 bg-[#59745b]" />
          </aside>
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.title} className="border-b border-[#20251f]/10 pb-12 last:border-b-0">
                <h2 className="text-2xl font-bold tracking-tight text-[#20251f]">
                  {section.title}
                </h2>
                <div className="policy-copy mt-4 max-w-2xl text-sm leading-relaxed text-[#596257]">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-[#20251f]/10 pt-8 text-xs text-[#7a8678] flex items-center justify-between">
          <span>Ops Ninja · Privacy Policy</span>
          <span>Zero third-party training · Cryptographic approval</span>
        </footer>
      </main>
    </div>
  );
}