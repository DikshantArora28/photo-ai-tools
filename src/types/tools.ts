export type BackgroundType = "transparent" | "color" | "gradient" | "image";

export interface BgRemoverSettings {
  feather: number;
  smooth: number;
  threshold: number;
  bgType: BackgroundType;
  bgColor: string;
  bgGradient: string;
  bgImage: string | null;
}

export interface ObjectRemoverSettings {
  brushSize: number;
}

export interface ImageCleanupSettings {
  noiseReduction: number;
  sharpness: number;
  scratchRemoval: boolean;
  brushSize: number;
}

export interface ColorizeSettings {
  intensity: number;
  saturation: number;
  colorHints: ColorHint[];
  referenceImage: string | null;
}

export interface ColorHint {
  x: number;
  y: number;
  color: string;
  id: string;
}

export type ToolType =
  | "background-remover"
  | "object-remover"
  | "image-cleanup"
  | "colorize";
