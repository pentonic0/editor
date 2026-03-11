/**
 * ToggleBlock.tsx
 * A collapsible toggle/accordion block.
 * Heading is always visible; body collapses/expands on click.
 * Both heading and body are inline-editable.
 */

"use client";
import { useState } from "react";
import { BlockData } from "../../utils/exportHtml";

interface ToggleData {
  heading: string;
  content: string;
}

interface ToggleBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<ToggleData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ToggleBlock({ block, onUpdate, onRemove, isSelected, onSelect }: ToggleBlockProps) {
  const data = block.data as unknown as ToggleData;
  const [isOpen, setIsOpen] = useState(true);

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
      {/* Remove button */}
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-red)",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: "0.75rem",
            zIndex: 10,
          }}
        >
          ✕
        </button>
      )}

      {/* Toggle header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75em",
          padding: "1em 1.2em",
          background: "var(--bg-elevated)",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          onSelect();
        }}
      >
        {/* Chevron indicator */}
        <span style={{
          fontSize: "0.7rem",
          color: "var(--accent-amber)",
          transition: "transform 0.2s ease",
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block",
          flexShrink: 0,
        }}>
          ▶
        </span>
        
        {/* Editable heading */}
        <div
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate(block.id, { heading: e.currentTarget.textContent || "" })}
          onClick={(e) => { e.stopPropagation(); }}
          style={{
            flex: 1,
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            outline: "none",
            cursor: isSelected ? "text" : "pointer",
          }}
        >
          {data.heading || (isSelected ? "Toggle heading" : "Toggle")}
        </div>
      </div>

      {/* Toggle body - collapsible */}
      {isOpen && (
        <div style={{
          padding: "1em 1.2em 1.2em",
          borderTop: "1px solid var(--border-subtle)",
          animation: "fadeIn 0.15s ease",
        }}>
          <div
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(block.id, { content: e.currentTarget.innerHTML })}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              outline: "none",
              minHeight: "2em",
            }}
            dangerouslySetInnerHTML={{ __html: data.content || (isSelected ? "Toggle content goes here..." : "") }}
          />
        </div>
      )}
    </div>
  );
}
