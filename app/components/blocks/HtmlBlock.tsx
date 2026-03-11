/**
 * HtmlBlock.tsx
 * A raw HTML input block that renders a preview of the entered HTML.
 * Also doubles as a Markdown block with simple preview rendering.
 * Split-pane view: code on left, preview on right.
 */

"use client";
import { useState } from "react";
import { BlockData } from "../../utils/exportHtml";

interface HtmlBlockData {
  html: string;
  isMarkdown: boolean;
}

interface HtmlBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<HtmlBlockData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

/** Basic markdown renderer for preview */
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.+<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|b|o|l|p|a])/gm, "<p>")
    .replace(/$(?![>])/gm, "</p>");
}

export default function HtmlBlock({ block, onUpdate, onRemove, isSelected, onSelect }: HtmlBlockProps) {
  const data = block.data as unknown as HtmlBlockData;
  const [view, setView] = useState<"code" | "preview" | "split">("split");

  const previewHtml = data.isMarkdown
    ? renderMarkdown(data.html || "")
    : data.html || "";

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
        border: `1px solid ${isSelected ? "var(--accent-amber)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {/* Mode toggle: HTML or Markdown */}
          <button
            onClick={() => onUpdate(block.id, { isMarkdown: false })}
            style={{
              padding: "3px 10px",
              background: !data.isMarkdown ? "var(--accent-amber)" : "transparent",
              color: !data.isMarkdown ? "#000" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
            }}
          >
            HTML
          </button>
          <button
            onClick={() => onUpdate(block.id, { isMarkdown: true })}
            style={{
              padding: "3px 10px",
              background: data.isMarkdown ? "var(--accent-amber)" : "transparent",
              color: data.isMarkdown ? "#000" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
            }}
          >
            Markdown
          </button>
        </div>
        
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {/* View toggle */}
          {(["code", "split", "preview"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "3px 10px",
                background: view === v ? "var(--bg-active)" : "transparent",
                color: "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--border-default)", margin: "0 4px" }} />
          <button
            onClick={() => onRemove(block.id)}
            style={{
              padding: "3px 8px",
              background: "transparent",
              color: "var(--accent-red)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{
        display: "flex",
        minHeight: "160px",
      }}>
        {/* Code editor pane */}
        {(view === "code" || view === "split") && (
          <div style={{
            flex: 1,
            borderRight: view === "split" ? "1px solid var(--border-subtle)" : "none",
          }}>
            <textarea
              value={data.html || ""}
              onChange={(e) => onUpdate(block.id, { html: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder={data.isMarkdown ? "# Write Markdown here...\n\nUse **bold**, *italic*, `code`, etc." : "<p>Enter raw HTML here...</p>"}
              spellCheck={false}
              style={{
                width: "100%",
                minHeight: "160px",
                padding: "12px 14px",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                tabSize: 2,
              }}
            />
          </div>
        )}
        
        {/* Preview pane */}
        {(view === "preview" || view === "split") && (
          <div style={{
            flex: 1,
            padding: "12px 14px",
            background: "var(--bg-secondary)",
            overflow: "auto",
          }}>
            {previewHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                style={{
                  fontFamily: "var(--font-editorial)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "var(--text-primary)",
                }}
              />
            ) : (
              <p style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontStyle: "italic",
              }}>
                Preview will appear here...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
