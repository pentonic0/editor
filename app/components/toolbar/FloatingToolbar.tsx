/**
 * FloatingToolbar.tsx
 * A context-sensitive floating toolbar that appears when text is selected in the editor.
 * Provides: Bold, Italic, Underline, Highlight, Blockquote, Link, and Heading shortcuts.
 * Positions itself above the selection using getBoundingClientRect().
 * Auto-hides when selection is cleared.
 */

"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";

interface FloatingToolbarProps {
  editor: Editor | null;
}

interface ToolbarPosition {
  top: number;
  left: number;
}

export default function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  /**
   * Compute the toolbar position based on the current text selection.
   * Centers the toolbar horizontally above the selection.
   */
  const updatePosition = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    
    // Only show for non-empty text selections
    if (from === to) {
      setIsVisible(false);
      setShowLinkInput(false);
      return;
    }
    
    // Get the DOM selection to find pixel coordinates
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }
    
    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width === 0) {
      setIsVisible(false);
      return;
    }
    
    // Calculate center position above the selection
    const toolbarWidth = 360;
    const toolbarHeight = 44;
    const margin = 8;
    
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    let top = rect.top - toolbarHeight - margin;
    
    // Clamp to viewport edges
    left = Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8));
    if (top < 8) top = rect.bottom + margin + window.scrollY;
    
    setPosition({ top, left });
    setIsVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    
    // Listen for selection changes
    const handleSelectionUpdate = () => {
      // Small delay to let the selection stabilize
      setTimeout(updatePosition, 10);
    };
    
    editor.on("selectionUpdate", handleSelectionUpdate);
    document.addEventListener("mouseup", handleSelectionUpdate);
    document.addEventListener("keyup", handleSelectionUpdate);
    
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      document.removeEventListener("mouseup", handleSelectionUpdate);
      document.removeEventListener("keyup", handleSelectionUpdate);
    };
  }, [editor, updatePosition]);

  const handleLinkSubmit = () => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  if (!isVisible || !position || !editor) return null;

  const btnStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "6px 10px",
    background: isActive ? "rgba(212, 168, 71, 0.2)" : "transparent",
    color: isActive ? "var(--accent-amber)" : "var(--text-secondary)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: "var(--font-body)",
    fontWeight: isActive ? 700 : 400,
    lineHeight: 1,
    transition: "all 0.1s",
    display: "flex",
    alignItems: "center",
    gap: "3px",
    whiteSpace: "nowrap",
  });

  const divider = (
    <div style={{ width: 1, background: "var(--border-default)", margin: "4px 2px" }} />
  );

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 1000,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        alignItems: "center",
        padding: "4px 6px",
        gap: "2px",
        animation: "fadeIn 0.1s ease",
        userSelect: "none",
        minWidth: "max-content",
      }}
      // Prevent toolbar click from losing the selection
      onMouseDown={(e) => e.preventDefault()}
    >
      {showLinkInput ? (
        // Link URL input mode
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>🔗</span>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLinkSubmit();
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
            }}
            placeholder="https://..."
            autoFocus
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              outline: "none",
              width: "180px",
            }}
          />
          <button
            onClick={handleLinkSubmit}
            style={{
              padding: "3px 10px",
              background: "var(--accent-amber)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#000",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Apply
          </button>
          <button
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            style={{ ...btnStyle(false), padding: "3px 6px" }}
          >
            ✕
          </button>
        </div>
      ) : (
        // Main toolbar buttons
        <>
          {/* Bold */}
          <button
            style={btnStyle(editor.isActive("bold"))}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (⌘B)"
          >
            <strong>B</strong>
          </button>
          
          {/* Italic */}
          <button
            style={btnStyle(editor.isActive("italic"))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (⌘I)"
          >
            <em>I</em>
          </button>
          
          {/* Underline */}
          <button
            style={btnStyle(editor.isActive("underline"))}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (⌘U)"
          >
            <span style={{ textDecoration: "underline" }}>U</span>
          </button>

          {divider}
          
          {/* Highlight */}
          <button
            style={btnStyle(editor.isActive("highlight"))}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          >
            <span style={{ fontSize: "0.9rem" }}>▲</span>
          </button>
          
          {/* Blockquote */}
          <button
            style={btnStyle(editor.isActive("blockquote"))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <span style={{ fontSize: "1rem" }}>&quot;</span>
          </button>

          {divider}

          {/* Headings */}
          <button
            style={btnStyle(editor.isActive("heading", { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            H2
          </button>
          
          <button
            style={btnStyle(editor.isActive("heading", { level: 3 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            H3
          </button>

          {divider}

          {/* Link */}
          <button
            style={btnStyle(editor.isActive("link"))}
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const existingHref = editor.getAttributes("link").href || "";
                setLinkUrl(existingHref);
                setShowLinkInput(true);
              }
            }}
            title="Link (⌘K)"
          >
            🔗
          </button>
        </>
      )}
    </div>
  );
}
