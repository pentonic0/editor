"use client";

import { useCallback, useEffect, useState } from "react";
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

import { generateStandaloneHtml, downloadHtmlFile, BlockData } from "../../utils/exportHtml";

import ImageBlock from "../blocks/ImageBlock";
import EmbedBlock from "../blocks/EmbedBlock";
import CalloutBlock from "../blocks/CalloutBlock";
import ToggleBlock from "../blocks/ToggleBlock";
import ButtonBlock from "../blocks/ButtonBlock";
import HtmlBlock from "../blocks/HtmlBlock";
import GalleryBlock from "../blocks/GalleryBlock";
import { AudioBlock, VideoBlock } from "../blocks/MediaBlocks";

import FloatingToolbar from "../toolbar/FloatingToolbar";
import BlockInserter, { BlockType } from "../toolbar/BlockInserter";

const lowlight = createLowlight(common);

type ThemeMode = "light" | "dark";

export default function KoenigEditor() {
  const [title, setTitle] = useState("Untitled Article");
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [caretInserterPos, setCaretInserterPos] = useState<{ top: number; left: number } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Tell your story… (use + on empty lines to insert blocks)" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: "<p></p>",
    onUpdate: ({ editor }) => {
      const words = editor.getText().trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    },
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const updateCaretInserter = useCallback(() => {
    if (!editor) return;

    const { from, to, $from } = editor.state.selection;
    const isCollapsed = from === to;
    const isParagraph = $from.parent.type.name === "paragraph";
    const isLineEmpty = isParagraph && $from.parent.content.size === 0;
    const isAtLineStart = $from.parentOffset === 0;

    if (!isCollapsed || !isLineEmpty || !isAtLineStart) {
      setCaretInserterPos(null);
      return;
    }

    const coords = editor.view.coordsAtPos(from);
    setCaretInserterPos({ top: coords.top, left: coords.left - 44 });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    updateCaretInserter();
    editor.on("selectionUpdate", updateCaretInserter);
    editor.on("update", updateCaretInserter);
    window.addEventListener("scroll", updateCaretInserter, true);
    window.addEventListener("resize", updateCaretInserter);

    return () => {
      editor.off("selectionUpdate", updateCaretInserter);
      editor.off("update", updateCaretInserter);
      window.removeEventListener("scroll", updateCaretInserter, true);
      window.removeEventListener("resize", updateCaretInserter);
    };
  }, [editor, updateCaretInserter]);

  const insertBlock = useCallback((type: BlockType) => {
    if (type === "divider") {
      editor?.chain().focus().setHorizontalRule().createParagraphNear().run();
      return;
    }

    const newBlock: BlockData = {
      id: crypto.randomUUID(),
      type,
      data: getDefaultBlockData(type),
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    editor?.chain().focus("end").insertContent("<p></p>").run();
  }, [editor]);

  function getDefaultBlockData(type: BlockType): Record<string, unknown> {
    switch (type) {
      case "image": return { src: "", alt: "", caption: "", width: "normal" };
      case "gallery": return { images: [], columns: 3 };
      case "video": return { src: "", poster: "" };
      case "audio": return { src: "", title: "", artist: "" };
      case "embed": return { url: "", embedType: "", embedHtml: "", caption: "" };
      case "callout": return { text: "", emoji: "💡", variant: "info" };
      case "toggle": return { heading: "Click to expand", content: "" };
      case "button": return { text: "Click here", url: "", alignment: "center", variant: "primary" };
      case "html": return { html: "", isMarkdown: false };
      case "markdown": return { html: "", isMarkdown: true };
      default: return {};
    }
  }

  const updateBlock = useCallback((id: string, data: Partial<Record<string, unknown>>) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, data: { ...b.data, ...data } } : b)));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedBlockId(null);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    const destination = result.destination;
    if (!destination || result.source.index === destination.index) return;
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(destination.index, 0, moved);
      return next;
    });
  }, []);

  const handleExport = useCallback(async () => {
    if (!editor) return;
    setIsExporting(true);
    try {
      let fullContent = editor.getHTML();
      blocks.forEach(block => {
        fullContent += `<div data-block-id="${block.id}"></div>`;
      });
      const html = generateStandaloneHtml({ title, content: fullContent, blocks });
      downloadHtmlFile(html, title || "article");
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } finally {
      setIsExporting(false);
    }
  }, [editor, blocks, title]);

  const renderBlock = (block: BlockData) => {
    const commonProps = {
      block,
      onUpdate: updateBlock,
      onRemove: removeBlock,
      isSelected: selectedBlockId === block.id,
      onSelect: () => setSelectedBlockId(block.id),
    };

    switch (block.type) {
      case "image": return <ImageBlock {...commonProps} />;
      case "gallery": return <GalleryBlock {...commonProps} />;
      case "video": return <VideoBlock {...commonProps} />;
      case "audio": return <AudioBlock {...commonProps} />;
      case "embed": return <EmbedBlock {...commonProps} />;
      case "callout": return <CalloutBlock {...commonProps} />;
      case "toggle": return <ToggleBlock {...commonProps} />;
      case "button": return <ButtonBlock {...commonProps} />;
      case "html":
      case "markdown": return <HtmlBlock {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column" }}>
      <nav style={{
        height: "56px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
          <div style={{ width: 28, height: 28, background: "var(--accent-amber)", borderRadius: 6, display: "grid", placeItems: "center", fontWeight: 700 }}>K</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Article"
            style={{ background: "transparent", border: "none", color: "var(--text-primary)", outline: "none", maxWidth: 320 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-muted)", fontSize: "0.8rem" }}>
          <span>{wordCount} words</span>
          <span>{blocks.length} block{blocks.length === 1 ? "" : "s"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
            style={navBtnStyle(false)}
            title="Toggle light/dark theme"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{ ...navBtnStyle(isExporting), background: exportSuccess ? "var(--accent-green)" : "var(--accent-amber)", color: "#000", border: "none", padding: "8px 14px" }}
          >
            {exportSuccess ? "✓ Exported" : isExporting ? "Exporting..." : "⬇ Export HTML"}
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "60px 24px 120px" }}>
        <div style={{ width: "100%", maxWidth: "740px", position: "relative" }}>
          <FloatingToolbar editor={editor} />
          {caretInserterPos && (
            <div style={{ position: "fixed", top: caretInserterPos.top, left: caretInserterPos.left, zIndex: 1200 }}>
              <BlockInserter onInsert={insertBlock} position="floating" />
            </div>
          )}

          <EditorContent editor={editor} />

          {blocks.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="blocks-droppable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginTop: "1em" }}>
                    {blocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(draggableProvided, draggableSnapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            style={{ position: "relative", ...draggableProvided.draggableProps.style, opacity: draggableSnapshot.isDragging ? 0.85 : 1 }}
                          >
                            <div
                              {...draggableProvided.dragHandleProps}
                              style={{
                                position: "absolute", left: "-32px", top: "50%", transform: "translateY(-50%)", width: "24px", height: "32px",
                                display: "grid", placeItems: "center", color: "var(--text-muted)", cursor: "grab", opacity: selectedBlockId === block.id ? 1 : 0
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                              onMouseLeave={(e) => { if (selectedBlockId !== block.id) e.currentTarget.style.opacity = "0"; }}
                            >
                              ⠿
                            </div>
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
        </div>
      </div>
    </div>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    background: "transparent",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    color: disabled ? "var(--text-muted)" : "var(--text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-body)",
    fontSize: "0.82rem",
    fontWeight: 500,
  };
}
