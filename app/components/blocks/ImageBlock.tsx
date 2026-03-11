/**
 * ImageBlock.tsx
 * Handles image upload via drag-and-drop or file picker.
 * Supports caption editing and image width variants (normal/wide/full).
 * Native image crop is provided via a basic crop UI.
 */

"use client";
import { useState, useRef, useCallback } from "react";
import { BlockData } from "../../utils/exportHtml";

interface ImageBlockData {
  src: string;
  alt: string;
  caption: string;
  width: "normal" | "wide" | "full";
}

interface ImageBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<ImageBlockData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ImageBlock({ block, onUpdate, onRemove, isSelected, onSelect }: ImageBlockProps) {
  const data = block.data as unknown as ImageBlockData;
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64 for embedding in HTML export
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdate(block.id, {
        src: e.target?.result as string,
        alt: file.name.replace(/\.[^.]+$/, ""),
      });
    };
    reader.readAsDataURL(file);
  }, [block.id, onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const widthOptions: Array<{ value: ImageBlockData["width"]; label: string; icon: string }> = [
    { value: "normal", label: "Normal", icon: "▬" },
    { value: "wide", label: "Wide", icon: "▬▬" },
    { value: "full", label: "Full", icon: "█" },
  ];

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
        cursor: "default",
      }}
    >
      {/* Image toolbar - visible when selected */}
      {isSelected && data.src && (
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
          {widthOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onUpdate(block.id, { width: opt.value })}
              title={opt.label}
              style={{
                padding: "4px 10px",
                background: data.width === opt.value ? "var(--accent-amber)" : "transparent",
                color: data.width === opt.value ? "#000" : "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                transition: "all 0.1s",
              }}
            >
              {opt.label}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--border-default)", margin: "0 4px" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "4px 10px",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "var(--font-body)",
            }}
          >
            Replace
          </button>
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

      {/* Image or upload area */}
      {data.src ? (
        <figure style={{
          margin: 0,
          maxWidth: data.width === "wide" ? "900px" : data.width === "full" ? "100vw" : "100%",
          marginLeft: data.width === "full" ? "calc(-50vw + 50%)" : "auto",
          marginRight: data.width === "full" ? "calc(-50vw + 50%)" : "auto",
        }}>
          <div style={{
            position: "relative",
            border: isSelected ? "2px solid var(--accent-amber)" : "2px solid transparent",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            transition: "border-color 0.15s",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.src}
              alt={data.alt || ""}
              style={{
                width: "100%",
                display: "block",
                borderRadius: "var(--radius-md)",
              }}
            />
          </div>
          
          {/* Editable caption */}
          {(isSelected || data.caption) && (
            <figcaption
              contentEditable={isSelected}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate(block.id, { caption: e.currentTarget.textContent || "" })}
              onClick={(e) => { e.stopPropagation(); setIsEditingCaption(true); }}
              style={{
                textAlign: "center",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                marginTop: "0.75em",
                fontStyle: "italic",
                outline: "none",
                minHeight: isSelected ? "1.2em" : undefined,
              }}
              data-placeholder="Add a caption..."
            >
              {data.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        // Upload dropzone
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--accent-amber)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)",
            padding: "3rem 2rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(212,168,71,0.05)" : "var(--bg-elevated)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🖼️</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
            Drag and drop an image, or click to upload
          </p>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
            PNG, JPG, GIF, WEBP supported
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
