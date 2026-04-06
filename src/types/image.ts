export interface ImageFile {
  file: File;
  url: string;
  width: number;
  height: number;
  name: string;
  type: string;
  size: number;
}

export interface ProcessedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export type BrushMode = "erase" | "restore";

export type ComparisonMode = "slider" | "side-by-side" | "toggle";

export interface BrushSettings {
  mode: BrushMode;
  size: number;
  hardness: number;
}

export interface HistoryEntry {
  maskData: ImageData;
  timestamp: number;
}
