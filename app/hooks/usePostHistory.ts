/**
 * usePostHistory.ts
 * Manages post history snapshots (distinct from TipTap's built-in undo/redo).
 * Saves named checkpoints so users can jump back to previous article states.
 */

import { useState, useCallback, useRef } from "react";

export interface HistorySnapshot {
  id: string;
  timestamp: Date;
  label: string;
  content: string;
  title: string;
  blocks: unknown[];
}

const MAX_HISTORY_ENTRIES = 50;

export function usePostHistory() {
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Save a named snapshot of the current post state.
   * Debounced by 2s to avoid saving on every keystroke.
   */
  const saveSnapshot = useCallback((
    content: string,
    title: string,
    blocks: unknown[],
    label: string = "Auto-saved"
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const snapshot: HistorySnapshot = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        label,
        content,
        title,
        blocks,
      };
      
      setHistory(prev => {
        // Remove any future history if we saved from a past state
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(snapshot);
        
        // Cap history length
        if (newHistory.length > MAX_HISTORY_ENTRIES) {
          newHistory.shift();
        }
        
        return newHistory;
      });
      
      setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY_ENTRIES - 1));
    }, 2000);
  }, [currentIndex]);

  /**
   * Save an immediate (non-debounced) snapshot with a specific label.
   * Used when user performs major actions like adding/removing blocks.
   */
  const saveImmediateSnapshot = useCallback((
    content: string,
    title: string, 
    blocks: unknown[],
    label: string
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    const snapshot: HistorySnapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      label,
      content,
      title,
      blocks,
    };
    
    setHistory(prev => {
      const newHistory = [...prev.slice(0, currentIndex + 1), snapshot];
      if (newHistory.length > MAX_HISTORY_ENTRIES) newHistory.shift();
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY_ENTRIES - 1));
  }, [currentIndex]);

  /** Restore a specific snapshot by ID */
  const restoreSnapshot = useCallback((snapshotId: string): HistorySnapshot | null => {
    const index = history.findIndex(s => s.id === snapshotId);
    if (index === -1) return null;
    
    setCurrentIndex(index);
    return history[index];
  }, [history]);

  /** Format timestamp for display */
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return {
    history,
    currentIndex,
    saveSnapshot,
    saveImmediateSnapshot,
    restoreSnapshot,
    formatTimestamp,
    hasHistory: history.length > 0,
  };
}
