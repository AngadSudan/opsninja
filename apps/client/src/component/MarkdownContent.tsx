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
  const headingClass = isInverse ? "text-white" : "text-[#20251f]";
  const strongClass = isInverse ? "text-white" : "text-[#20251f]";
  const linkClass = isInverse
    ? "text-[#dce6ff] decoration-[#dce6ff] hover:text-white"
    : "text-[#3564a8] decoration-[#b8cbe8] hover:text-[#20251f]";

  return (
    <div
      className={`markdown-content text-sm leading-7 ${
        isInverse ? "text-white" : "text-[#596257]"
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
              className={`mb-2 mt-5 text-sm font-bold uppercase tracking-wide ${isInverse ? "text-[#dce6ff]" : "text-[#426347]"}`}
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
              className={`my-4 border-l-2 px-4 py-2 ${isInverse ? "border-[#dce6ff] bg-white/10 text-white" : "border-[#9db29b] bg-[#f1f7ef] text-[#596257]"}`}
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
                  ? "font-mono text-xs text-[#e9eee7]"
                  : `rounded px-1.5 py-0.5 font-mono text-[0.85em] ${isInverse ? "bg-white/15 text-white" : "bg-[#edf0eb] text-[#20251f]"}`
              }
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-lg border border-[#dfe5dc] bg-[#20251f] p-4 font-mono text-xs leading-6 text-[#e9eee7]">
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
              className={`border border-[#dfe5dc] px-3 py-2 font-bold ${isInverse ? "bg-white/10 text-white" : "bg-[#f1f7ef] text-[#20251f]"}`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#dfe5dc] px-3 py-2 align-top">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-[#dfe5dc]" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
