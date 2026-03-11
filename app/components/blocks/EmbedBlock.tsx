/**
 * EmbedBlock.tsx
 * Converts pasted URLs into rich embeds.
 * Supports YouTube, Twitter/X, Spotify, CodePen, and generic iframes.
 * Falls back to a link card for unsupported URLs.
 */

"use client";
import { useState } from "react";
import { BlockData } from "../../utils/exportHtml";

interface EmbedData {
  url: string;
  embedType: "youtube" | "twitter" | "spotify" | "codepen" | "generic" | "";
  embedHtml: string;
  caption: string;
}

interface EmbedBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<EmbedData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

/** Detect embed type from URL and generate embed HTML */
function generateEmbed(url: string): { type: EmbedData["embedType"]; html: string } {
  // YouTube: standard and short URLs
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      type: "youtube",
      html: `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:8px;aspect-ratio:16/9;"></iframe>`,
    };
  }

  // Spotify: tracks, albums, playlists
  const spotifyMatch = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return {
      type: "spotify",
      html: `<iframe src="https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" style="border-radius:12px;"></iframe>`,
    };
  }

  // Twitter/X: tweet URLs
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return {
      type: "twitter",
      html: `<blockquote class="twitter-tweet" data-theme="dark"><a href="${url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>`,
    };
  }

  // CodePen
  const codepenMatch = url.match(/codepen\.io\/([^/]+)\/pen\/([^/?]+)/);
  if (codepenMatch) {
    return {
      type: "codepen",
      html: `<iframe src="https://codepen.io/${codepenMatch[1]}/embed/${codepenMatch[2]}?default-tab=result" width="100%" height="400" frameborder="0" style="border-radius:8px;"></iframe>`,
    };
  }

  // Generic iframe fallback
  return { type: "generic", html: "" };
}

export default function EmbedBlock({ block, onUpdate, onRemove, isSelected, onSelect }: EmbedBlockProps) {
  const data = block.data as unknown as EmbedData;
  const [urlInput, setUrlInput] = useState(data.url || "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!urlInput.trim()) return;
    
    try {
      new URL(urlInput); // Validate URL format
      const { type, html } = generateEmbed(urlInput.trim());
      onUpdate(block.id, {
        url: urlInput.trim(),
        embedType: type,
        embedHtml: html,
      });
      setError("");
    } catch {
      setError("Please enter a valid URL");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") setUrlInput(data.url || "");
  };

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
        border: isSelected ? "2px solid var(--accent-amber)" : "2px solid transparent",
        borderRadius: "var(--radius-md)",
        transition: "border-color 0.15s",
        overflow: "hidden",
      }}
    >
      {/* Remove button when selected */}
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 20,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-red)",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: "0.75rem",
          }}
        >
          ✕ Remove
        </button>
      )}

      {data.embedHtml ? (
        // Render the embed
        <div>
          <div
            dangerouslySetInnerHTML={{ __html: data.embedHtml }}
            style={{ lineHeight: 0 }}
          />
          {/* Caption editor */}
          {(isSelected || data.caption) && (
            <div
              contentEditable={isSelected}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate(block.id, { caption: e.currentTarget.textContent || "" })}
              style={{
                textAlign: "center",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                padding: "0.6em",
                outline: "none",
                fontStyle: "italic",
              }}
            >
              {data.caption || (isSelected ? "Add a caption..." : "")}
            </div>
          )}
          {/* Replace URL option */}
          {isSelected && (
            <div style={{
              padding: "8px",
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              gap: "8px",
            }}>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Replace URL..."
                style={{
                  flex: 1,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  padding: "6px 10px",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  padding: "6px 14px",
                  background: "var(--accent-amber)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "#000",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Update
              </button>
            </div>
          )}
        </div>
      ) : (
        // URL input form
        <div style={{
          background: "var(--bg-elevated)",
          padding: "2rem",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}>
            <span style={{ fontSize: "1.5rem" }}>🔗</span>
            <div>
              <p style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9rem" }}>
                Embed anything
              </p>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
                YouTube, Spotify, Twitter/X, CodePen, and more
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="Paste a URL to embed..."
              autoFocus
              style={{
                flex: 1,
                background: "var(--bg-primary)",
                border: `1px solid ${error ? "var(--accent-red)" : "var(--border-default)"}`,
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                padding: "10px 14px",
                fontSize: "0.9rem",
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                padding: "10px 20px",
                background: "var(--accent-amber)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "#000",
                fontSize: "0.9rem",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Embed
            </button>
          </div>
          {error && (
            <p style={{ color: "var(--accent-red)", fontFamily: "var(--font-body)", fontSize: "0.8rem", marginTop: "6px" }}>
              {error}
            </p>
          )}
          <button
            onClick={() => onRemove(block.id)}
            style={{
              marginTop: "12px",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
