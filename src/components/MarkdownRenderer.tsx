import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting:
 * - Links: [label](url)
 * - Images: ![alt](url)
 * - Bold: **bold** or __bold__
 * - Italic: *italic* or _italic_
 * - Strikethrough: ~~strikethrough~~
 * - Highlight: ==highlight== or <mark>text</mark>
 * - Underline: <u>text</u>
 * - Inline code: `code`
 * - HTML spans with color
 */
function parseInline(text: string): React.ReactNode[] {
  // Regex to match inline tokens
  const tokenRegex =
    /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~|==([^=]+)==|<u>([^<]+)<\/u>|<mark>([^<]+)<\/mark>|`([^`]+)`|<span style="color:\s*([^"]+)">([^<]+)<\/span>)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[0];

    // 1. Image: ![alt](url)
    if (fullMatch.startsWith("![") && match[2] !== undefined && match[3]) {
      const alt = match[2];
      const src = match[3];
      elements.push(
        <span key={`img-${match.index}`} className="block my-4">
          <img
            src={src}
            alt={alt || "Article Illustration"}
            className="rounded-xl border border-slate-200 max-h-96 w-auto mx-auto shadow-sm object-cover"
            loading="lazy"
          />
          {alt && (
            <span className="block text-center text-xs text-slate-500 mt-1.5 italic">
              {alt}
            </span>
          )}
        </span>
      );
    }
    // 2. Link: [text](url)
    else if (fullMatch.startsWith("[") && match[4] && match[5]) {
      const label = match[4];
      const url = match[5];
      elements.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-[#b87a14] hover:text-[#071325] font-semibold underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
        >
          {label}
        </a>
      );
    }
    // 3. Bold: **text** or __text__
    else if (match[6] || match[7]) {
      const boldText = match[6] || match[7];
      elements.push(
        <strong key={`bold-${match.index}`} className="font-bold text-[#071325]">
          {boldText}
        </strong>
      );
    }
    // 4. Italic: *text* or _text_
    else if (match[8] || match[9]) {
      const italicText = match[8] || match[9];
      elements.push(
        <em key={`italic-${match.index}`} className="italic text-slate-700">
          {italicText}
        </em>
      );
    }
    // 5. Strikethrough: ~~text~~
    else if (match[10]) {
      elements.push(
        <del key={`del-${match.index}`} className="line-through text-slate-500">
          {match[10]}
        </del>
      );
    }
    // 6. Highlight: ==text==
    else if (match[11] || match[13]) {
      const hlText = match[11] || match[13];
      elements.push(
        <mark key={`mark-${match.index}`} className="bg-amber-200 text-slate-900 px-1 py-0.5 rounded">
          {hlText}
        </mark>
      );
    }
    // 7. Underline: <u>text</u>
    else if (match[12]) {
      elements.push(
        <u key={`u-${match.index}`} className="underline underline-offset-2">
          {match[12]}
        </u>
      );
    }
    // 8. Inline code: `code`
    else if (match[14]) {
      elements.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 bg-slate-100 text-[#b87a14] rounded font-mono text-xs border border-slate-200"
        >
          {match[14]}
        </code>
      );
    }
    // 9. Styled Color: <span style="color: #...">text</span>
    else if (match[15] && match[16]) {
      elements.push(
        <span key={`color-${match.index}`} style={{ color: match[15] }}>
          {match[16]}
        </span>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

/**
 * Robust, clean Markdown parser and semantic HTML renderer.
 * Eliminates unformatted raw characters (dashes, #, *) and renders clean typography.
 */
export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into block sections by double newlines
  const rawBlocks = content.split(/\r?\n\r?\n/);

  return (
    <div className={`space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base ${className}`}>
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={bIdx} className="my-6 border-slate-200" />;
        }

        // Fenced Code Block
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split(/\r?\n/);
          const lang = lines[0].replace(/^```/, "").trim();
          const codeBody = lines.slice(1, lines[lines.length - 1] === "```" ? -1 : undefined).join("\n");
          return (
            <div key={bIdx} className="my-4 rounded-xl overflow-hidden bg-[#071325] text-slate-200 border border-slate-800">
              {lang && (
                <div className="bg-[#0c1a32] px-4 py-1.5 text-[11px] font-mono font-bold text-[#e5a93c] border-b border-slate-800 flex justify-between items-center">
                  <span>{lang.toUpperCase()}</span>
                </div>
              )}
              <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Headings
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={bIdx} className="text-sm font-bold text-[#071325] pt-2 uppercase tracking-wide">
              {parseInline(trimmed.replace(/^####\s+/, ""))}
            </h4>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={bIdx}
              className="text-base sm:text-lg font-bold text-[#071325] pt-4 pb-1 border-b border-slate-100"
            >
              {parseInline(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={bIdx}
              className="text-lg sm:text-xl font-extrabold text-[#071325] pt-5 pb-1.5 border-b border-slate-200"
            >
              {parseInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={bIdx} className="text-xl sm:text-2xl font-extrabold text-[#071325] pt-4">
              {parseInline(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }

        // Blockquotes (> text)
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed
            .split(/\r?\n/)
            .map((l) => l.replace(/^>\s*/, ""))
            .join(" ");
          return (
            <blockquote
              key={bIdx}
              className="border-l-4 border-[#e5a93c] pl-4 py-1 italic bg-amber-50/50 rounded-r-xl text-slate-700 text-sm my-3"
            >
              {parseInline(quoteLines)}
            </blockquote>
          );
        }

        // YouTube Video Embed Detection (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)
        const ytMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch && (trimmed.startsWith("http") || trimmed.startsWith("<iframe"))) {
          const videoId = ytMatch[1];
          return (
            <div key={bIdx} className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200 my-4 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          );
        }

        // Bullet Lists (- item or * item)
        const isBulletList = trimmed
          .split(/\r?\n/)
          .every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "));

        if (isBulletList) {
          const listItems = trimmed.split(/\r?\n/);
          return (
            <ul key={bIdx} className="space-y-2 pl-1 my-3">
              {listItems.map((item, liIdx) => {
                const cleanItem = item.trim().replace(/^[-*]\s+/, "");
                return (
                  <li key={liIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e5a93c] mt-2 shrink-0" />
                    <span className="flex-1 leading-relaxed">{parseInline(cleanItem)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered Lists (1. item)
        const isNumberedList = trimmed
          .split(/\r?\n/)
          .every((line) => /^\d+\.\s+/.test(line.trim()));

        if (isNumberedList) {
          const listItems = trimmed.split(/\r?\n/);
          return (
            <ol key={bIdx} className="space-y-2 pl-1 my-3">
              {listItems.map((item, liIdx) => {
                const cleanItem = item.trim().replace(/^\d+\.\s+/, "");
                return (
                  <li key={liIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="font-mono text-xs font-bold text-[#b87a14] bg-[#e5a93c]/15 px-2 py-0.5 rounded shrink-0">
                      {liIdx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed pt-0.5">{parseInline(cleanItem)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Paragraph containing potential mixed single newlines
        const lines = trimmed.split(/\r?\n/);
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {parseInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
