import { create } from "zustand";
import type {
  BgRemoverSettings,
  ObjectRemoverSettings,
  ImageCleanupSettings,
  ColorizeSettings,
} from "@/types/tools";
import {
  DEFAULT_BG_REMOVER_SETTINGS,
  DEFAULT_OBJECT_REMOVER_SETTINGS,
  DEFAULT_CLEANUP_SETTINGS,
  DEFAULT_COLORIZE_SETTINGS,
} from "@/lib/utils/constants";

interface ToolState {
  bgRemover: BgRemoverSettings;
  objectRemover: ObjectRemoverSettings;
  imageCleanup: ImageCleanupSettings;
  colorize: ColorizeSettings;

  updateBgRemover: (settings: Partial<BgRemoverSettings>) => void;
  updateObjectRemover: (settings: Partial<ObjectRemoverSettings>) => void;
  updateImageCleanup: (settings: Partial<ImageCleanupSettings>) => void;
  updateColorize: (settings: Partial<ColorizeSettings>) => void;
  resetTool: (tool: string) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  bgRemover: { ...DEFAULT_BG_REMOVER_SETTINGS },
  objectRemover: { ...DEFAULT_OBJECT_REMOVER_SETTINGS },
  imageCleanup: { ...DEFAULT_CLEANUP_SETTINGS },
  colorize: { ...DEFAULT_COLORIZE_SETTINGS },

  updateBgRemover: (settings) =>
    set((state) => ({ bgRemover: { ...state.bgRemover, ...settings } })),
  updateObjectRemover: (settings) =>
    set((state) => ({ objectRemover: { ...state.objectRemover, ...settings } })),
  updateImageCleanup: (settings) =>
    set((state) => ({ imageCleanup: { ...state.imageCleanup, ...settings } })),
  updateColorize: (settings) =>
    set((state) => ({ colorize: { ...state.colorize, ...settings } })),
  resetTool: (tool) => {
    switch (tool) {
      case "bgRemover":
        set({ bgRemover: { ...DEFAULT_BG_REMOVER_SETTINGS } });
        break;
      case "objectRemover":
        set({ objectRemover: { ...DEFAULT_OBJECT_REMOVER_SETTINGS } });
        break;
      case "imageCleanup":
        set({ imageCleanup: { ...DEFAULT_CLEANUP_SETTINGS } });
        break;
      case "colorize":
        set({ colorize: { ...DEFAULT_COLORIZE_SETTINGS } });
        break;
    }
  },
}));
