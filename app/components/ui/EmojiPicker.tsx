/**
 * EmojiPicker.tsx
 * Shows a floating emoji suggestion popup when the user types ":query".
 * Triggered by the editor's input handler detecting the pattern.
 */

"use client";
import { EmojiEntry } from "../../utils/emojiData";

interface EmojiPickerProps {
  emojis: EmojiEntry[];
  selectedIndex: number;
  onSelect: (emoji: EmojiEntry) => void;
  position: { top: number; left: number } | null;
}

export default function EmojiPicker({ emojis, selectedIndex, onSelect, position }: EmojiPickerProps) {
  if (!emojis.length || !position) return null;

  return (
    <div style={{
      position: "fixed",
      top: position.top,
      left: position.left,
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      zIndex: 600,
      overflow: "hidden",
      animation: "slideUp 0.1s ease",
      minWidth: "180px",
    }}>
      <div style={{
        padding: "4px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          padding: "2px 6px",
        }}>
          Emoji suggestions
        </p>
      </div>
      {emojis.map((entry, i) => (
        <button
          key={entry.name}
          onClick={() => onSelect(entry)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            background: i === selectedIndex ? "var(--bg-active)" : "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "background 0.1s",
          }}
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{entry.emoji}</span>
          <div>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "var(--text-primary)",
            }}>
              :{entry.name}:
            </span>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginLeft: "6px",
            }}>
              {entry.keywords.slice(0, 2).join(", ")}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
