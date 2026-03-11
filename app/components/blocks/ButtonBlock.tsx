/**
 * ButtonBlock.tsx
 * A CTA button block with editable label, URL, and alignment (left/center/right).
 * Renders as a styled anchor tag in the exported HTML.
 */

"use client";
import { BlockData } from "../../utils/exportHtml";

interface ButtonData {
  text: string;
  url: string;
  alignment: "left" | "center" | "right";
  variant: "primary" | "secondary" | "outline";
}

interface ButtonBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<ButtonData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const BUTTON_VARIANTS = {
  primary:   { bg: "var(--accent-amber)",   color: "#000",              border: "transparent" },
  secondary: { bg: "var(--bg-active)",       color: "var(--text-primary)", border: "var(--border-default)" },
  outline:   { bg: "transparent",            color: "var(--accent-amber)", border: "var(--accent-amber)" },
};

export default function ButtonBlock({ block, onUpdate, onRemove, isSelected, onSelect }: ButtonBlockProps) {
  const data = block.data as unknown as ButtonData;
  const variant = data.variant || "primary";
  const variantStyle = BUTTON_VARIANTS[variant];

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
        textAlign: data.alignment || "center",
      }}
    >
      {/* Controls toolbar */}
      {isSelected && (
        <div style={{
          position: "absolute",
          top: "-52px",
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
          whiteSpace: "nowrap",
        }}>
          {/* Alignment */}
          {(["left", "center", "right"] as const).map(align => (
            <button
              key={align}
              onClick={() => onUpdate(block.id, { alignment: align })}
              style={{
                padding: "4px 8px",
                background: data.alignment === align ? "var(--bg-active)" : "transparent",
                color: "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              {align === "left" ? "⬅" : align === "center" ? "⬛" : "➡"}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--border-default)", margin: "0 4px" }} />
          {/* Variants */}
          {(Object.keys(BUTTON_VARIANTS) as Array<keyof typeof BUTTON_VARIANTS>).map(v => (
            <button
              key={v}
              onClick={() => onUpdate(block.id, { variant: v })}
              style={{
                padding: "4px 8px",
                background: variant === v ? "var(--bg-active)" : "transparent",
                color: "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: variant === v ? 600 : 400,
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
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

      {/* The button itself */}
      <div style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}>
        <button
          style={{
            padding: "0.75em 2em",
            background: variantStyle.bg,
            color: variantStyle.color,
            border: `2px solid ${variantStyle.border}`,
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: isSelected ? "text" : "pointer",
            outline: isSelected ? "2px solid var(--accent-amber)" : "none",
            outlineOffset: "2px",
            transition: "all 0.15s",
          }}
        >
          <span
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(block.id, { text: e.currentTarget.textContent || "" })}
            onClick={(e) => { e.stopPropagation(); }}
            style={{ outline: "none" }}
          >
            {data.text || "Button text"}
          </span>
        </button>
        
        {/* URL input - shown when selected */}
        {isSelected && (
          <input
            value={data.url || ""}
            onChange={(e) => onUpdate(block.id, { url: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="https://example.com"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              padding: "6px 12px",
              fontSize: "0.8rem",
              fontFamily: "var(--font-body)",
              outline: "none",
              width: "240px",
              textAlign: "center",
            }}
          />
        )}
      </div>
    </div>
  );
}
