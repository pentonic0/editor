/**
 * AudioBlock.tsx & VideoBlock.tsx
 * Media upload blocks for audio and video content.
 * Supports file upload via drag-and-drop or picker, plus metadata editing.
 */

"use client";
import { useRef, useState } from "react";
import { BlockData } from "../../utils/exportHtml";

// ==================== AUDIO BLOCK ====================

interface AudioData {
  src: string;
  title: string;
  artist: string;
}

interface AudioBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<AudioData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export function AudioBlock({ block, onUpdate, onRemove, isSelected, onSelect }: AudioBlockProps) {
  const data = block.data as unknown as AudioData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdate(block.id, {
        src: e.target?.result as string,
        title: data.title || file.name.replace(/\.[^.]+$/, ""),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
        border: `1px solid ${isSelected ? "var(--accent-amber)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--bg-elevated)",
        transition: "border-color 0.15s",
      }}
    >
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "var(--bg-primary)",
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
      
      {data.src ? (
        <div style={{ padding: "1.2em 1.4em" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1em", marginBottom: "1em" }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--accent-amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}>
              🎵
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {isSelected ? (
                <>
                  <input
                    value={data.title || ""}
                    onChange={(e) => onUpdate(block.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Track title..."
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      outline: "none",
                      marginBottom: "2px",
                    }}
                  />
                  <input
                    value={data.artist || ""}
                    onChange={(e) => onUpdate(block.id, { artist: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Artist name..."
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      outline: "none",
                    }}
                  />
                </>
              ) : (
                <>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    {data.title || "Audio track"}
                  </p>
                  {data.artist && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {data.artist}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <audio
            controls
            src={data.src}
            style={{ width: "100%", height: "40px" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <div
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "2.5rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(212,168,71,0.05)" : "transparent",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎵</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
            Upload an audio file
          </p>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
            MP3, WAV, OGG, M4A supported
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

// ==================== VIDEO BLOCK ====================

interface VideoData {
  src: string;
  poster: string;
}

interface VideoBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<VideoData>) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export function VideoBlock({ block, onUpdate, onRemove, isSelected, onSelect }: VideoBlockProps) {
  const data = block.data as unknown as VideoData;
  const videoFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith("video/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onUpdate(block.id, { src: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handlePosterFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onUpdate(block.id, { poster: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        margin: "1.5em 0",
        border: `2px solid ${isSelected ? "var(--accent-amber)" : "transparent"}`,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          display: "flex",
          gap: "4px",
        }}>
          {data.src && (
            <button
              onClick={(e) => { e.stopPropagation(); posterFileRef.current?.click(); }}
              style={{
                background: "rgba(0,0,0,0.7)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "white",
                cursor: "pointer",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
              }}
            >
              Set poster
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
            style={{
              background: "rgba(0,0,0,0.7)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "var(--accent-red)",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: "0.75rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {data.src ? (
        <video
          controls
          src={data.src}
          poster={data.poster || undefined}
          style={{
            width: "100%",
            borderRadius: "var(--radius-md)",
            display: "block",
            maxHeight: "480px",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          onClick={() => videoFileRef.current?.click()}
          style={{
            padding: "3rem",
            textAlign: "center",
            cursor: "pointer",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎬</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
            Upload a video file
          </p>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
            MP4, WebM, MOV supported
          </p>
        </div>
      )}

      <input
        ref={videoFileRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }}
      />
      <input
        ref={posterFileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePosterFile(f); }}
      />
    </div>
  );
}
