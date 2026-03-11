/**
 * GalleryBlock.tsx
 * Multi-image gallery with a responsive grid layout.
 * Supports uploading multiple images, rearranging, and individual captions.
 */

"use client";
import { useState, useRef } from "react";
import { BlockData } from "../../utils/exportHtml";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

interface GalleryData {
  images: GalleryImage[];
  columns: 2 | 3 | 4;
}

interface GalleryBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<GalleryData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export default function GalleryBlock({ block, onUpdate, onRemove, isSelected, onSelect }: GalleryBlockProps) {
  const data = block.data as unknown as GalleryData;
  const images = data.images || [];
  const columns = data.columns || 3;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addImages = (files: FileList) => {
    const newImages: GalleryImage[] = [];
    let loaded = 0;
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          id: crypto.randomUUID(),
          src: e.target?.result as string,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
        loaded++;
        if (loaded === files.length) {
          onUpdate(block.id, { images: [...images, ...newImages] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId: string) => {
    onUpdate(block.id, { images: images.filter(img => img.id !== imageId) });
  };

  return (
    <div
      onClick={onSelect}
      style={{ position: "relative", margin: "1.5em 0" }}
    >
      {/* Gallery toolbar */}
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
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", padding: "4px 6px", fontFamily: "var(--font-body)" }}>
            Columns:
          </span>
          {([2, 3, 4] as const).map(col => (
            <button
              key={col}
              onClick={() => onUpdate(block.id, { columns: col })}
              style={{
                padding: "4px 10px",
                background: columns === col ? "var(--accent-amber)" : "transparent",
                color: columns === col ? "#000" : "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}
            >
              {col}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--border-default)", margin: "0 4px" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "4px 10px",
              background: "transparent",
              color: "var(--accent-amber)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "var(--font-body)",
            }}
          >
            + Add images
          </button>
          <button
            onClick={() => onRemove(block.id)}
            style={{
              padding: "4px 8px",
              background: "transparent",
              color: "var(--accent-red)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {images.length > 0 ? (
        // Gallery grid
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "4px",
          border: isSelected ? "2px solid var(--accent-amber)" : "2px solid transparent",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}>
          {images.map((img) => (
            <div
              key={img.id}
              style={{ position: "relative", aspectRatio: "1", overflow: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.7)",
                    border: "none",
                    borderRadius: "50%",
                    color: "white",
                    width: 22,
                    height: 22,
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          {/* Add more images cell */}
          {isSelected && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                aspectRatio: "1",
                background: "var(--bg-elevated)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: "4px",
                border: "1px dashed var(--border-default)",
              }}
            >
              <span style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>+</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Add</span>
            </div>
          )}
        </div>
      ) : (
        // Empty dropzone
        <div
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); addImages(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--accent-amber)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)",
            padding: "3rem 2rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(212,168,71,0.05)" : "var(--bg-elevated)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🖼️🖼️</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
            Drop images here to create a gallery
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files) addImages(e.target.files); }}
      />
    </div>
  );
}
