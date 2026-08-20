import { useState, type ReactNode } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * High-performance, dependency-free Markdown & Code renderer
 * Supports: Code blocks with copy button, inline code, bold/italic,
 * headings, lists, blockquotes, callouts, and clean tables.
 */
export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Parse message content into structural blocks (code blocks vs text blocks)
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-3 font-sans text-xs sm:text-sm leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <CodeBlockView
              key={idx}
              code={block.content}
              language={block.language || "typescript"}
            />
          );
        }

        return <TextBlockView key={idx} text={block.content} />;
      })}
    </div>
  );
}

// ─── Code Block Component with Copy Action ────────────────────────────────────

function CodeBlockView({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language.toUpperCase() || "TYPESCRIPT";

  return (
    <div className="my-3 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-xl overflow-hidden font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-[#2b7fff]" />
          <span className="font-semibold text-zinc-300 font-sans tracking-wide text-[10px] uppercase">
            {displayLang}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg gap-1.5 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span className="font-sans">Copy code</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto leading-relaxed text-blue-100/95 font-mono text-[11px] sm:text-xs whitespace-pre">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// ─── Text Block View with Line-by-Line Formatter ──────────────────────────────

function TextBlockView({ text }: { text: string }) {
  const lines = text.split("\n");

  const renderedLines: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        renderedLines.push(
          <ol key={`ol-${renderedLines.length}`} className="my-2 space-y-1.5 pl-1 list-none">
            {listItems}
          </ol>
        );
      } else {
        renderedLines.push(
          <ul key={`ul-${renderedLines.length}`} className="my-2 space-y-1.5 pl-1 list-none">
            {listItems}
          </ul>
        );
      }
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushList();
      renderedLines.push(
        <h4 key={i} className="font-display font-bold text-sm sm:text-base text-zinc-950 mt-3 mb-1">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      renderedLines.push(
        <h3 key={i} className="font-display font-bold text-base sm:text-lg text-zinc-950 mt-3 mb-1">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      renderedLines.push(
        <h2 key={i} className="font-display font-bold text-lg sm:text-xl text-zinc-950 mt-4 mb-1">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquotes / Callout
    if (trimmed.startsWith("> ")) {
      flushList();
      renderedLines.push(
        <blockquote
          key={i}
          className="my-2 pl-3.5 py-1.5 border-l-2 border-[#2b7fff] bg-blue-50/40 rounded-r-xl text-xs text-zinc-700 italic"
        >
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      isNumberedList = false;
      listItems.push(
        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-800 leading-relaxed">
          <span className="size-1.5 rounded-full bg-[#2b7fff] mt-2 shrink-0" />
          <span>{formatInline(trimmed.slice(2))}</span>
        </li>
      );
      continue;
    }

    // Numbered Lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      isNumberedList = true;
      const num = numberedMatch[1];
      const rest = numberedMatch[2];
      listItems.push(
        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-800 leading-relaxed">
          <span className="size-5 rounded-md bg-zinc-100 text-[#2b7fff] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-zinc-200/80">
            {num}
          </span>
          <span className="flex-1">{formatInline(rest)}</span>
        </li>
      );
      continue;
    }

    // Regular Paragraph
    flushList();
    renderedLines.push(
      <p key={i} className="leading-relaxed text-zinc-800 my-1">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{renderedLines}</div>;
}

// ─── Inline Text Formatter (Bold, Italic, Inline Code, Badges) ────────────────

function formatInline(text: string): ReactNode {
  // Tokenize string for code (`...`), bold (**...**), italic (*...*)
  const tokens = [];
  let cursor = 0;

  // Regex matches inline code `code`, bold **text**, or italic *text*
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchStr = match[0];

    // Push preceding plain text
    if (matchIndex > cursor) {
      tokens.push(text.substring(cursor, matchIndex));
    }

    if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
      // Inline Code
      tokens.push(
        <code
          key={matchIndex}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 border border-zinc-200/80 text-[#2b7fff] font-mono text-[11px] font-semibold"
        >
          {matchStr.slice(1, -1)}
        </code>
      );
    } else if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
      // Bold
      tokens.push(
        <strong key={matchIndex} className="font-bold text-zinc-950">
          {matchStr.slice(2, -2)}
        </strong>
      );
    } else if (matchStr.startsWith("*") && matchStr.endsWith("*")) {
      // Italic
      tokens.push(
        <em key={matchIndex} className="italic text-zinc-800">
          {matchStr.slice(1, -1)}
        </em>
      );
    }

    cursor = matchIndex + matchStr.length;
  }

  // Push remaining text
  if (cursor < text.length) {
    tokens.push(text.substring(cursor));
  }

  return tokens.length > 0 ? tokens : text;
}

// ─── Block Parser ─────────────────────────────────────────────────────────────

interface MarkdownBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const lang = match[1] || "typescript";
    const code = match[2];

    // Any text before code block
    if (startIndex > lastIndex) {
      const textPart = text.substring(lastIndex, startIndex).trim();
      if (textPart) {
        blocks.push({ type: "text", content: textPart });
      }
    }

    // Code block
    blocks.push({ type: "code", language: lang, content: code });
    lastIndex = codeBlockRegex.lastIndex;
  }

  // Trailing text
  if (lastIndex < text.length) {
    const trailing = text.substring(lastIndex).trim();
    if (trailing) {
      blocks.push({ type: "text", content: trailing });
    }
  }

  // If no code blocks found, return entire text as one block
  if (blocks.length === 0 && text.trim()) {
    blocks.push({ type: "text", content: text.trim() });
  }

  return blocks;
}
