/**
 * BlockInserter.tsx
 * The "+" button and slash command menu for inserting new content blocks.
 * Appears on hover near empty lines or when "/" is typed.
 * Provides a searchable list of all available block types.
 */

"use client";
import { useState, useEffect, useRef } from "react";

export type BlockType = 
  | "image" | "gallery" | "video" | "audio"
  | "embed" | "callout" | "toggle" | "button"
  | "html" | "markdown" | "divider";

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  group: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
  // Media
  { type: "image",    label: "Image",    description: "Upload or embed an image",       icon: "🖼️",  group: "Media" },
  { type: "gallery",  label: "Gallery",  description: "Multiple images in a grid",      icon: "🗂️",  group: "Media" },
  { type: "video",    label: "Video",    description: "Upload a video file",             icon: "🎬",  group: "Media" },
  { type: "audio",    label: "Audio",    description: "Upload an audio file",            icon: "🎵",  group: "Media" },
  // Embeds
  { type: "embed",    label: "Embed",    description: "YouTube, Spotify, Twitter, etc.", icon: "🔗",  group: "Embed" },
  // Content
  { type: "callout",  label: "Callout",  description: "Highlighted info or warning box", icon: "💡",  group: "Content" },
  { type: "toggle",   label: "Toggle",   description: "Collapsible content section",     icon: "▶️",  group: "Content" },
  { type: "button",   label: "Button",   description: "Call-to-action button",           icon: "🔘",  group: "Content" },
  { type: "divider",  label: "Divider",  description: "Horizontal line separator",       icon: "➖",  group: "Content" },
  // Code
  { type: "html",     label: "HTML",     description: "Raw HTML block with preview",     icon: "💻",  group: "Code" },
  { type: "markdown", label: "Markdown", description: "Write markdown with preview",     icon: "📝",  group: "Code" },
];

interface BlockInserterProps {
  onInsert: (type: BlockType) => void;
  isVisible?: boolean;
  position?: "floating" | "inline";
}

export default function BlockInserter({ onInsert, position = "inline" }: BlockInserterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Group and filter options
  const filteredOptions = BLOCK_OPTIONS.filter(opt =>
    !search ||
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filteredOptions.reduce((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = [];
    acc[opt.group].push(opt);
    return acc;
  }, {} as Record<string, BlockOption[]>);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setIsOpen(false); setSearch(""); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filteredOptions[highlightedIndex]) {
      e.preventDefault();
      handleInsert(filteredOptions[highlightedIndex].type);
    }
  };

  const handleInsert = (type: BlockType) => {
    onInsert(type);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      {/* + Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Insert block"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: isOpen ? "var(--accent-amber)" : "var(--bg-elevated)",
          border: `1px solid ${isOpen ? "var(--accent-amber)" : "var(--border-default)"}`,
          color: isOpen ? "#000" : "var(--text-secondary)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          fontWeight: 300,
          transition: "all 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = "var(--bg-elevated)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
      >
        {isOpen ? "×" : "+"}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          width: "280px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 500,
          overflow: "hidden",
          animation: "slideUp 0.15s ease",
        }}>
          {/* Search */}
          <div style={{
            padding: "10px 12px",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search blocks..."
              style={{
                width: "100%",
                background: "var(--bg-primary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                padding: "8px 10px",
                fontSize: "0.85rem",
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
          </div>

          {/* Block list */}
          <div style={{ maxHeight: "320px", overflowY: "auto", padding: "6px" }}>
            {Object.entries(grouped).map(([group, options]) => (
              <div key={group}>
                <div style={{
                  padding: "6px 8px 4px",
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {group}
                </div>
                {options.map((opt, i) => {
                  const globalIndex = filteredOptions.indexOf(opt);
                  return (
                    <button
                      key={opt.type}
                      onClick={() => handleInsert(opt.type)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        background: highlightedIndex === globalIndex ? "var(--bg-active)" : "transparent",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    >
                      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{opt.icon}</span>
                      <div>
                        <div style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          lineHeight: 1.2,
                        }}>
                          {opt.label}
                        </div>
                        <div style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: "1px",
                        }}>
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <p style={{
                textAlign: "center",
                padding: "1.5rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
              }}>
                No blocks found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
