/**
 * KoenigEditor.tsx
 * The main editor component that wires together:
 * - TipTap rich text editor (for inline text editing with markdown shortcuts)
 * - Custom block system (image, embed, callout, toggle, button, html, gallery, audio, video)
 * - Drag-and-drop block reordering via @hello-pangea/dnd
 * - Floating formatting toolbar (appears on text selection)
 * - Slash command / "+" block inserter
 * - Emoji autocomplete (triggers on ":query" pattern)
 * - Post history snapshots (auto-saved every 2 seconds)
 * - HTML export (downloads a standalone .html file)
 * - Keyboard shortcuts for undo/redo
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Utils & hooks
import { generateStandaloneHtml, downloadHtmlFile, BlockData } from "../../utils/exportHtml";
import { searchEmojis, detectEmojiTrigger, EmojiEntry } from "../../utils/emojiData";
import { usePostHistory } from "../../hooks/usePostHistory";

// Block components
import ImageBlock from "../blocks/ImageBlock";
import EmbedBlock from "../blocks/EmbedBlock";
import CalloutBlock from "../blocks/CalloutBlock";
import ToggleBlock from "../blocks/ToggleBlock";
import ButtonBlock from "../blocks/ButtonBlock";
import HtmlBlock from "../blocks/HtmlBlock";
import GalleryBlock from "../blocks/GalleryBlock";
import { AudioBlock, VideoBlock } from "../blocks/MediaBlocks";

// UI components
import FloatingToolbar from "../toolbar/FloatingToolbar";
import BlockInserter, { BlockType } from "../toolbar/BlockInserter";
import HistoryPanel from "../ui/HistoryPanel";
import EmojiPicker from "../ui/EmojiPicker";

// Create lowlight with common languages for syntax highlighting
const lowlight = createLowlight(common);

export default function KoenigEditor() {
  // ============================================================
  // STATE
  // ============================================================
  const [title, setTitle] = useState("Untitled Article");
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Emoji autocomplete state
  const [emojiSuggestions, setEmojiSuggestions] = useState<EmojiEntry[]>([]);
  const [emojiSelectedIndex, setEmojiSelectedIndex] = useState(0);
  const [emojiPosition, setEmojiPosition] = useState<{ top: number; left: number } | null>(null);
  const [emojiQuery, setEmojiQuery] = useState("");

  // Post history
  const { history, currentIndex, saveSnapshot, saveImmediateSnapshot, restoreSnapshot, formatTimestamp } = usePostHistory();

  const editorContainerRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // TIPTAP EDITOR SETUP
  // ============================================================
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in code block to use lowlight version
        codeBlock: false,
        // Configure heading levels
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: "Tell your story… (type / to insert a block)",
      }),
      // Syntax-highlighted code blocks
      CodeBlockLowlight.configure({ lowlight }),
    ],
    
    content: "<p></p>",
    
    // Handle slash command for block insertion
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      
      // Update word count
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
      
      // Emoji autocomplete detection
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 25), from, "\n", "\0"
      );
      const emojiQ = detectEmojiTrigger(textBefore);
      
      if (emojiQ && emojiQ.length >= 1) {
        const suggestions = searchEmojis(emojiQ);
        if (suggestions.length > 0) {
          setEmojiSuggestions(suggestions);
          setEmojiQuery(emojiQ);
          setEmojiSelectedIndex(0);
          
          // Position emoji popup near cursor
          try {
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const rect = domSelection.getRangeAt(0).getBoundingClientRect();
              setEmojiPosition({ top: rect.bottom + 8, left: rect.left });
            }
          } catch {}
          return;
        }
      }
      
      // Clear emoji suggestions if no trigger
      setEmojiSuggestions([]);
      setEmojiPosition(null);
      
      // Auto-save snapshot
      saveSnapshot(editor.getHTML(), title, blocks, "Auto-saved");
    },
    
    // Keyboard shortcut handler
    editorProps: {
      handleKeyDown: (view, event) => {
        // Handle emoji autocomplete keyboard navigation
        if (emojiSuggestions.length > 0) {
          if (event.key === "ArrowDown") {
            setEmojiSelectedIndex(i => Math.min(i + 1, emojiSuggestions.length - 1));
            return true;
          }
          if (event.key === "ArrowUp") {
            setEmojiSelectedIndex(i => Math.max(i - 1, 0));
            return true;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            insertEmoji(emojiSuggestions[emojiSelectedIndex]);
            return true;
          }
          if (event.key === "Escape") {
            setEmojiSuggestions([]);
            return true;
          }
        }
        return false;
      },
    },
  });

  // ============================================================
  // EMOJI INSERTION
  // ============================================================
  const insertEmoji = useCallback((entry: EmojiEntry) => {
    if (!editor) return;
    
    // Find and replace the ":query" trigger text with the emoji
    const { from } = editor.state.selection;
    const triggerLength = emojiQuery.length + 1; // +1 for ":"
    
    editor
      .chain()
      .focus()
      .deleteRange({ from: from - triggerLength, to: from })
      .insertContent(entry.emoji)
      .run();
    
    setEmojiSuggestions([]);
    setEmojiPosition(null);
  }, [editor, emojiQuery]);

  // ============================================================
  // BLOCK MANAGEMENT
  // ============================================================

  /** Add a new block of the given type after the current text */
  const insertBlock = useCallback((type: BlockType) => {
    const newBlock: BlockData = {
      id: crypto.randomUUID(),
      type,
      data: getDefaultBlockData(type),
    };
    
    // If type is divider, insert an HR into the editor instead of creating a block
    if (type === "divider") {
      editor?.chain().focus().setHorizontalRule().run();
      return;
    }
    
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    saveImmediateSnapshot(editor?.getHTML() || "", title, [...blocks, newBlock], `Added ${type} block`);
  }, [editor, title, blocks, saveImmediateSnapshot]);

  /** Get sensible default data for each block type */
  function getDefaultBlockData(type: BlockType): Record<string, unknown> {
    switch (type) {
      case "image":    return { src: "", alt: "", caption: "", width: "normal" };
      case "gallery":  return { images: [], columns: 3 };
      case "video":    return { src: "", poster: "" };
      case "audio":    return { src: "", title: "", artist: "" };
      case "embed":    return { url: "", embedType: "", embedHtml: "", caption: "" };
      case "callout":  return { text: "", emoji: "💡", variant: "info" };
      case "toggle":   return { heading: "Click to expand", content: "" };
      case "button":   return { text: "Click here", url: "", alignment: "center", variant: "primary" };
      case "html":     return { html: "", isMarkdown: false };
      case "markdown": return { html: "", isMarkdown: true };
      default:         return {};
    }
  }

  /** Update a block's data fields */
  const updateBlock = useCallback((id: string, data: Partial<Record<string, unknown>>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data: { ...b.data, ...data } } : b));
  }, []);

  /** Remove a block from the editor */
  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedBlockId(null);
    saveImmediateSnapshot(editor?.getHTML() || "", title, blocks.filter(b => b.id !== id), "Removed block");
  }, [editor, title, blocks, saveImmediateSnapshot]);

  // ============================================================
  // DRAG AND DROP REORDERING
  // ============================================================
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    setBlocks(prev => {
      const reordered = [...prev];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      return reordered;
    });
    
    saveImmediateSnapshot(editor?.getHTML() || "", title, blocks, "Reordered blocks");
  }, [editor, title, blocks, saveImmediateSnapshot]);

  // ============================================================
  // EXPORT
  // ============================================================
  const handleExport = useCallback(async () => {
    if (!editor) return;
    setIsExporting(true);
    
    try {
      // Build HTML with block placeholders replaced by actual block HTML
      const editorHtml = editor.getHTML();
      
      // Build the full content: editor text + all blocks in order
      let fullContent = editorHtml;
      blocks.forEach(block => {
        fullContent += `<div data-block-id="${block.id}"></div>`;
      });
      
      const html = generateStandaloneHtml({
        title,
        content: fullContent,
        blocks,
      });
      
      downloadHtmlFile(html, title || "article");
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [editor, title, blocks]);

  // ============================================================
  // HISTORY RESTORE
  // ============================================================
  const handleRestoreSnapshot = useCallback((snapshotId: string) => {
    const snapshot = restoreSnapshot(snapshotId);
    if (!snapshot || !editor) return;
    
    editor.commands.setContent(snapshot.content);
    setTitle(snapshot.title);
    setBlocks(snapshot.blocks as BlockData[]);
    setShowHistory(false);
  }, [editor, restoreSnapshot]);

  // ============================================================
  // KEYBOARD SHORTCUTS (global)
  // ============================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor?.chain().focus().undo().run();
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        editor?.chain().focus().redo().run();
      }
      if (ctrl && e.key === "e") {
        e.preventDefault();
        handleExport();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleExport]);

  // ============================================================
  // CLICK OUTSIDE DESELECTS BLOCKS
  // ============================================================
  const handleEditorAreaClick = useCallback((e: React.MouseEvent) => {
    // If clicking directly on the editor area (not a block), deselect blocks
    const target = e.target as HTMLElement;
    if (target === e.currentTarget || target.closest(".ProseMirror")) {
      setSelectedBlockId(null);
    }
  }, []);

  // ============================================================
  // RENDER BLOCK
  // ============================================================
  const renderBlock = (block: BlockData) => {
    const commonProps = {
      block,
      onUpdate: updateBlock,
      onRemove: removeBlock,
      isSelected: selectedBlockId === block.id,
      onSelect: () => setSelectedBlockId(block.id),
    };

    switch (block.type) {
      case "image":    return <ImageBlock {...commonProps} />;
      case "gallery":  return <GalleryBlock {...commonProps} />;
      case "video":    return <VideoBlock {...commonProps} />;
      case "audio":    return <AudioBlock {...commonProps} />;
      case "embed":    return <EmbedBlock {...commonProps} />;
      case "callout":  return <CalloutBlock {...commonProps} />;
      case "toggle":   return <ToggleBlock {...commonProps} />;
      case "button":   return <ButtonBlock {...commonProps} />;
      case "html":
      case "markdown": return <HtmlBlock {...commonProps} />;
      default:         return null;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ====================================================
          TOP NAVIGATION BAR
          ==================================================== */}
      <nav style={{
        height: "56px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        gap: "16px",
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
          <div style={{
            width: 28,
            height: 28,
            background: "var(--accent-amber)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            flexShrink: 0,
            fontWeight: 700,
          }}>
            K
          </div>
          
          {/* Editable title in nav */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Article"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 500,
              outline: "none",
              flex: 1,
              minWidth: 0,
              maxWidth: "320px",
            }}
          />
        </div>

        {/* Center: Status indicators */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "0.8rem",
        }}>
          <span>{wordCount} words</span>
          <span>{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Undo/Redo */}
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo (⌘Z)"
            style={navBtnStyle(!editor?.can().undo())}
          >
            ↩
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo (⌘⇧Z)"
            style={navBtnStyle(!editor?.can().redo())}
          >
            ↪
          </button>

          <div style={{ width: 1, height: 20, background: "var(--border-default)" }} />

          {/* History */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            title="View post history"
            style={{
              ...navBtnStyle(false),
              background: showHistory ? "rgba(212, 168, 71, 0.1)" : undefined,
              color: showHistory ? "var(--accent-amber)" : undefined,
            }}
          >
            🕐 History
          </button>

          <div style={{ width: 1, height: 20, background: "var(--border-default)" }} />

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            title="Export as HTML (⌘E)"
            style={{
              padding: "8px 16px",
              background: exportSuccess ? "var(--accent-green)" : "var(--accent-amber)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#000",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: isExporting ? "not-allowed" : "pointer",
              opacity: isExporting ? 0.7 : 1,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {exportSuccess ? "✓ Exported!" : isExporting ? "Exporting..." : "⬇ Export HTML"}
          </button>
        </div>
      </nav>

      {/* ====================================================
          MAIN EDITOR AREA
          ==================================================== */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        padding: "60px 24px 120px",
        marginRight: showHistory ? "260px" : 0,
        transition: "margin-right 0.2s ease",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "740px",
        }}>
          {/* Article title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: "0.8em",
              outline: "none",
              padding: 0,
            }}
          />

          {/* Article subtitle / excerpt field */}
          <textarea
            placeholder="Add a subtitle or excerpt (optional)..."
            rows={1}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-editorial)",
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              fontStyle: "italic",
              lineHeight: 1.5,
              marginBottom: "2.5em",
              outline: "none",
              resize: "none",
              padding: 0,
              overflow: "hidden",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "2em",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          {/* Rich text editor area */}
          <div
            ref={editorContainerRef}
            onClick={handleEditorAreaClick}
            style={{ position: "relative" }}
          >
            {/* Floating formatting toolbar */}
            <FloatingToolbar editor={editor} />

            {/* TipTap editor */}
            <EditorContent editor={editor} />

            {/* ============================================
                CUSTOM BLOCKS - Drag & Drop Container
                ============================================ */}
            {blocks.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="blocks-droppable">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        marginTop: "1em",
                        background: snapshot.isDraggingOver ? "rgba(212, 168, 71, 0.02)" : "transparent",
                        borderRadius: "var(--radius-md)",
                        transition: "background 0.15s",
                      }}
                    >
                      {blocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(draggableProvided, draggableSnapshot) => (
                            <div
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              style={{
                                position: "relative",
                                ...draggableProvided.draggableProps.style,
                                opacity: draggableSnapshot.isDragging ? 0.85 : 1,
                                transform: draggableProvided.draggableProps.style?.transform,
                              }}
                            >
                              {/* Drag handle - appears on hover */}
                              <div
                                {...draggableProvided.dragHandleProps}
                                style={{
                                  position: "absolute",
                                  left: "-32px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: "24px",
                                  height: "32px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--text-muted)",
                                  cursor: "grab",
                                  opacity: selectedBlockId === block.id ? 1 : 0,
                                  transition: "opacity 0.1s",
                                  fontSize: "0.8rem",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                onMouseLeave={(e) => {
                                  if (selectedBlockId !== block.id) e.currentTarget.style.opacity = "0";
                                }}
                              >
                                ⠿
                              </div>

                              {/* The actual block */}
                              {renderBlock(block)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Block inserter row */}
            <div style={{
              marginTop: "2em",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <BlockInserter onInsert={insertBlock} />
              <span style={{
                color: "var(--text-placeholder)",
                fontFamily: "var(--font-editorial)",
                fontSize: "0.9rem",
                fontStyle: "italic",
              }}>
                Insert a content block
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          HISTORY PANEL SIDEBAR
          ==================================================== */}
      {showHistory && (
        <HistoryPanel
          history={history}
          currentIndex={currentIndex}
          onRestore={handleRestoreSnapshot}
          onClose={() => setShowHistory(false)}
          formatTimestamp={formatTimestamp}
        />
      )}

      {/* ====================================================
          EMOJI AUTOCOMPLETE POPUP
          ==================================================== */}
      <EmojiPicker
        emojis={emojiSuggestions}
        selectedIndex={emojiSelectedIndex}
        onSelect={insertEmoji}
        position={emojiPosition}
      />
    </div>
  );
}

// Shared nav button style helper
function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "var(--radius-sm)",
    color: disabled ? "var(--text-muted)" : "var(--text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-body)",
    fontSize: "0.82rem",
    fontWeight: 500,
    transition: "all 0.1s",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    whiteSpace: "nowrap",
  };
}
