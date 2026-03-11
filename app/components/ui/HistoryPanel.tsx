/**
 * HistoryPanel.tsx
 * Sidebar panel showing the post revision history.
 * Users can click any snapshot to restore a previous version.
 * Snapshots are automatically created on edits (debounced) and manually on major actions.
 */

"use client";
import { HistorySnapshot } from "../../hooks/usePostHistory";

interface HistoryPanelProps {
  history: HistorySnapshot[];
  currentIndex: number;
  onRestore: (snapshotId: string) => void;
  onClose: () => void;
  formatTimestamp: (date: Date) => string;
}

export default function HistoryPanel({ history, currentIndex, onRestore, onClose, formatTimestamp }: HistoryPanelProps) {
  const reversedHistory = [...history].reverse();

  return (
    <div style={{
      position: "fixed",
      right: 0,
      top: 0,
      bottom: 0,
      width: "260px",
      background: "var(--bg-secondary)",
      borderLeft: "1px solid var(--border-default)",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      animation: "fadeIn 0.15s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 16px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h3 style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "0.9rem",
          color: "var(--text-primary)",
        }}>
          Post History
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "1.1rem",
            padding: "2px 6px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Snapshot list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {reversedHistory.length === 0 ? (
          <div style={{
            padding: "2rem 1rem",
            textAlign: "center",
          }}>
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
              No history yet. Start writing and history will appear here automatically.
            </p>
          </div>
        ) : (
          reversedHistory.map((snapshot, i) => {
            const isCurrentVersion = history.indexOf(snapshot) === currentIndex;
            
            return (
              <button
                key={snapshot.id}
                onClick={() => onRestore(snapshot.id)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: isCurrentVersion ? "rgba(212, 168, 71, 0.1)" : "transparent",
                  border: `1px solid ${isCurrentVersion ? "var(--accent-amber)" : "transparent"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "4px",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentVersion) e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentVersion) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: isCurrentVersion ? "var(--accent-amber)" : "var(--text-primary)",
                  marginBottom: "3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  {isCurrentVersion && (
                    <span style={{
                      fontSize: "0.65rem",
                      background: "var(--accent-amber)",
                      color: "#000",
                      padding: "1px 5px",
                      borderRadius: "2px",
                      fontWeight: 700,
                    }}>
                      CURRENT
                    </span>
                  )}
                  {snapshot.label}
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <span>🕐</span>
                  <span>{formatTimestamp(snapshot.timestamp)}</span>
                </div>
                {snapshot.title && (
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginTop: "3px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {snapshot.title}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
      
      {/* Footer hint */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)",
      }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          lineHeight: 1.5,
        }}>
          Snapshots are saved automatically as you write. Click any version to restore it.
        </p>
      </div>
    </div>
  );
}
