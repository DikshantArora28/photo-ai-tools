import { create } from "zustand";
import type { ImageFile, ProcessedImage, HistoryEntry } from "@/types/image";
import { MAX_UNDO_HISTORY } from "@/lib/utils/constants";
import { revokeObjectURL } from "@/lib/utils/imageConversion";

interface ImageState {
  original: ImageFile | null;
  processed: ProcessedImage | null;
  mask: ImageData | null;
  history: HistoryEntry[];
  historyIndex: number;

  setOriginal: (image: ImageFile) => void;
  setProcessed: (image: ProcessedImage) => void;
  setMask: (mask: ImageData, addToHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  original: null,
  processed: null,
  mask: null,
  history: [],
  historyIndex: -1,

  setOriginal: (image) => {
    const state = get();
    if (state.original?.url) revokeObjectURL(state.original.url);
    if (state.processed?.url) revokeObjectURL(state.processed.url);
    set({
      original: image,
      processed: null,
      mask: null,
      history: [],
      historyIndex: -1,
    });
  },

  setProcessed: (image) => {
    const state = get();
    if (state.processed?.url) revokeObjectURL(state.processed.url);
    set({ processed: image });
  },

  setMask: (mask, addToHistory = true) => {
    if (!addToHistory) {
      set({ mask });
      return;
    }
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ maskData: mask, timestamp: Date.now() });
    if (newHistory.length > MAX_UNDO_HISTORY) {
      newHistory.shift();
    }
    set({
      mask,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    set({
      mask: state.history[newIndex].maskData,
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    set({
      mask: state.history[newIndex].maskData,
      historyIndex: newIndex,
    });
  },

  reset: () => {
    const state = get();
    if (state.original?.url) revokeObjectURL(state.original.url);
    if (state.processed?.url) revokeObjectURL(state.processed.url);
    set({
      original: null,
      processed: null,
      mask: null,
      history: [],
      historyIndex: -1,
    });
  },
}));
