"use client";

import { useState, useCallback } from "react";

interface DocToolbarProps {
  /** Raw MDX content to copy (passed from the server page) */
  rawContent: string;
  /** Page title for AI context */
  title: string;
  /** Canonical URL of this page */
  url: string;
}

type ButtonState = "idle" | "copied" | "error";

function useClipboard() {
  const [state, setState] = useState<ButtonState>("idle");
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }, []);
  return { state, copy };
}

/**
 * DocToolbar
 *
 * Floating action bar rendered on every docs page.
 * Provides: Copy as MD · Open in ChatGPT · Open in Claude · Export PDF · Copy permalink
 */
export function DocToolbar({ rawContent, title, url }: DocToolbarProps) {
  const mdClipboard = useClipboard();
  const linkClipboard = useClipboard();

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCopyMarkdown() {
    const md = `# ${title}\n\nSource: ${url}\n\n---\n\n${rawContent}`;
    mdClipboard.copy(md);
  }

  function handleOpenChatGPT() {
    const prompt = encodeURIComponent(
      `I'm reading the AOTF documentation page "${title}".\n\nHere is the content:\n\n${rawContent.slice(0, 8000)}\n\nPlease help me understand this.`,
    );
    window.open(`https://chatgpt.com/?q=${prompt}`, "_blank", "noopener,noreferrer");
  }

  function handleOpenClaude() {
    // Claude supports pre-filled content via the new conversation URL
    const prompt = encodeURIComponent(
      `I'm reading the AOTF documentation page "${title}".\n\nHere is the content:\n\n${rawContent.slice(0, 8000)}\n\nPlease help me understand this.`,
    );
    window.open(`https://claude.ai/new?q=${prompt}`, "_blank", "noopener,noreferrer");
  }

  function handleExportPDF() {
    window.print();
  }

  function handleCopyLink() {
    linkClipboard.copy(url);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      data-toolbar
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.375rem",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.75rem",
          padding: "0.375rem",
          boxShadow: "0 4px 24px -4px rgba(0,0,0,0.18), 0 1px 4px -1px rgba(0,0,0,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Copy as Markdown */}
        <ToolbarButton
          title={mdClipboard.state === "copied" ? "Copied!" : "Copy as Markdown"}
          onClick={handleCopyMarkdown}
          aria-label="Copy page as Markdown"
        >
          {mdClipboard.state === "copied" ? "✓" : "📋"}
        </ToolbarButton>

        {/* Open in ChatGPT */}
        <ToolbarButton
          title="Open in ChatGPT"
          onClick={handleOpenChatGPT}
          aria-label="Open this page in ChatGPT"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
          </svg>
        </ToolbarButton>

        {/* Open in Claude */}
        <ToolbarButton
          title="Open in Claude"
          onClick={handleOpenClaude}
          aria-label="Open this page in Claude"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.304 3.541 12.025 0 6.696 3.541v7.082L0 14.459 2.696 20l5.279-3.541h8.05L21.304 20 24 14.459l-6.696-3.836V3.541zm-2.025 8.377H8.721V4.836l3.304-2.213 3.254 2.213v7.082z" />
          </svg>
        </ToolbarButton>

        {/* Divider */}
        <div
          aria-hidden
          style={{
            width: "1px",
            height: "24px",
            background: "hsl(var(--border))",
            alignSelf: "center",
            margin: "0 0.125rem",
          }}
        />

        {/* Export PDF */}
        <ToolbarButton
          title="Export as PDF"
          onClick={handleExportPDF}
          aria-label="Export page as PDF"
        >
          🖨️
        </ToolbarButton>

        {/* Copy Permalink */}
        <ToolbarButton
          title={linkClipboard.state === "copied" ? "Link copied!" : "Copy permalink"}
          onClick={handleCopyLink}
          aria-label="Copy page permalink"
        >
          {linkClipboard.state === "copied" ? "✓" : "🔗"}
        </ToolbarButton>
      </div>
    </div>
  );
}

// ─── Shared button component ─────────────────────────────────────────────────

interface ToolbarButtonProps {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label": string;
}

function ToolbarButton({ title, onClick, children, "aria-label": ariaLabel }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "1rem",
        color: "hsl(var(--muted-foreground))",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--accent) / 0.12)";
        (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--accent))";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--muted-foreground))";
      }}
    >
      {children}
    </button>
  );
}
