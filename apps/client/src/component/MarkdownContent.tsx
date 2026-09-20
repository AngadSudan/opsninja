import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
  className?: string;
  tone?: "default" | "inverse";
};

export default function MarkdownContent({
  content,
  className = "",
  tone = "default",
}: MarkdownContentProps) {
  const isInverse = tone === "inverse";
  const headingClass = isInverse ? "text-white" : "text-[var(--ink)]";
  const strongClass = isInverse ? "text-white" : "text-[var(--ink)]";
  const linkClass = isInverse
    ? "text-white decoration-white/60 hover:text-white"
    : "text-[var(--orange-dark)] decoration-[var(--orange)] hover:text-[var(--ink)]";

  return (
    <div
      className={`markdown-content text-sm leading-7 ${
        isInverse ? "text-white" : "text-[var(--ink-2)]"
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className={`mb-4 mt-6 text-xl font-extrabold ${headingClass} first:mt-0`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`mb-3 mt-6 text-lg font-bold ${headingClass} first:mt-0`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`mb-2 mt-5 text-sm font-bold ${isInverse ? "text-white" : "text-[var(--orange-dark)]"}`}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={`my-4 border-l-2 px-4 py-2 ${isInverse ? "border-white bg-white/10 text-white" : "border-[var(--orange)] bg-[var(--page)] text-[var(--ink-2)]"}`}
            >
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`font-semibold underline underline-offset-2 transition ${linkClass}`}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={`font-bold ${strongClass}`}>{children}</strong>
          ),
          code: ({ className: codeClassName, children }) => (
            <code
              className={
                codeClassName
                  ? "font-mono text-xs text-white"
                  : `rounded-[3px] px-1.5 py-0.5 font-mono text-[0.85em] ${isInverse ? "bg-white/15 text-white" : "bg-[var(--paper-muted)] text-[var(--ink)]"}`
              }
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-[5px] border border-[var(--line)] bg-[var(--ink)] p-4 font-mono text-xs leading-6 text-white">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full min-w-105 border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={`border border-[var(--line)] px-3 py-2 font-bold ${isInverse ? "bg-white/10 text-white" : "bg-[var(--paper-muted)] text-[var(--ink)]"}`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--line)] px-3 py-2 align-top">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-[var(--line)]" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
