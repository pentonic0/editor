/**
 * CalloutBlock.tsx
 * A highlighted callout box with an emoji icon and styled border.
 * Variants: info (blue), warning (amber), success (green), danger (red).
 * The emoji and text content are both editable inline.
 */

"use client";
import { useState } from "react";
import { BlockData } from "../../utils/exportHtml";

interface CalloutData {
  text: string;
  emoji: string;
  variant: "info" | "warning" | "success" | "danger";
}

interface CalloutBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<CalloutData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const VARIANTS = {
  info:    { bg: "rgba(74, 158, 255, 0.08)",   border: "var(--accent-blue)",   label: "Info",    icon: "💡" },
  warning: { bg: "rgba(212, 168, 71, 0.08)",   border: "var(--accent-amber)",  label: "Warning", icon: "⚠️" },
  success: { bg: "rgba(82, 201, 122, 0.08)",   border: "var(--accent-green)",  label: "Success", icon: "✅" },
  danger:  { bg: "rgba(224, 85, 85, 0.08)",    border: "var(--accent-red)",    label: "Danger",  icon: "🚨" },
};

const COMMON_EMOJIS = ["💡", "⚠️", "✅", "🚨", "📌", "🎉", "🔥", "💪", "🧠", "🎯", "📝", "🔒"];

export default function CalloutBlock({ block, onUpdate, onRemove, isSelected, onSelect }: CalloutBlockProps) {
  const data = block.data as unknown as CalloutData;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const variant = data.variant || "info";
  const variantStyle = VARIANTS[variant];

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
      }}
    >
      {/* Variant selector toolbar */}
      {isSelected && (
        <div style={{
          position: "absolute",
          top: "-44px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "6px 8px",
          display: "flex",
          gap: "4px",
          zIndex: 20,
          boxShadow: "var(--shadow-md)",
          animation: "fadeIn 0.15s ease",
        }}>
          {(Object.keys(VARIANTS) as Array<keyof typeof VARIANTS>).map(v => (
            <button
              key={v}
              onClick={() => onUpdate(block.id, { variant: v })}
              style={{
                padding: "4px 10px",
                background: variant === v ? VARIANTS[v].border : "transparent",
                color: variant === v ? "#fff" : "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                transition: "all 0.1s",
              }}
            >
              {VARIANTS[v].label}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--border-default)", margin: "0 4px" }} />
          <button
            onClick={() => onRemove(block.id)}
            style={{
              padding: "4px 8px",
              background: "transparent",
              color: "var(--accent-red)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Callout body */}
      <div style={{
        display: "flex",
        gap: "1em",
        padding: "1.2em 1.4em",
        borderRadius: "var(--radius-md)",
        background: variantStyle.bg,
        borderLeft: `3px solid ${variantStyle.border}`,
        border: isSelected ? `1px solid ${variantStyle.border}` : "1px solid transparent",
        borderLeftWidth: "3px",
        transition: "all 0.15s",
      }}>
        {/* Emoji button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(!showEmojiPicker);
            }}
            style={{
              fontSize: "1.4rem",
              background: "none",
              border: "none",
              cursor: isSelected ? "pointer" : "default",
              padding: 0,
              lineHeight: 1,
              marginTop: "2px",
              userSelect: "none",
            }}
          >
            {data.emoji || variantStyle.icon}
          </button>
          
          {/* Quick emoji picker */}
          {showEmojiPicker && isSelected && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "8px",
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "4px",
              zIndex: 30,
              boxShadow: "var(--shadow-lg)",
              animation: "fadeIn 0.1s ease",
            }}>
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(block.id, { emoji });
                    setShowEmojiPicker(false);
                  }}
                  style={{
                    padding: "6px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    borderRadius: "4px",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-active)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editable callout text */}
        <div
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate(block.id, { text: e.currentTarget.innerHTML })}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: "var(--text-primary)",
            outline: "none",
          }}
          dangerouslySetInnerHTML={{ __html: data.text || (isSelected ? "Type your callout text here..." : "") }}
        />
      </div>
    </div>
  );
}
