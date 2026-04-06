import { create } from "zustand";
import type { ComparisonMode } from "@/types/image";

interface AppState {
  isProcessing: boolean;
  processingProgress: number;
  processingMessage: string;
  error: string | null;
  comparisonMode: ComparisonMode;

  setProcessing: (processing: boolean, message?: string) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setComparisonMode: (mode: ComparisonMode) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isProcessing: false,
  processingProgress: 0,
  processingMessage: "",
  error: null,
  comparisonMode: "slider",

  setProcessing: (processing, message = "") =>
    set({ isProcessing: processing, processingMessage: message, processingProgress: 0 }),
  setProgress: (progress) => set({ processingProgress: progress }),
  setError: (error) => set({ error }),
  setComparisonMode: (mode) => set({ comparisonMode: mode }),
  reset: () =>
    set({
      isProcessing: false,
      processingProgress: 0,
      processingMessage: "",
      error: null,
    }),
}));
