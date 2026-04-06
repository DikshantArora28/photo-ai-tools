export const ACCEPTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
];

export const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif";

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const MAX_PROCESSING_DIMENSION = 4096;

export const MAX_UNDO_HISTORY = 10;

export const DEBOUNCE_MS = 300;

export const DEFAULT_BG_REMOVER_SETTINGS = {
  feather: 2,
  smooth: 1,
  threshold: 128,
  bgType: "transparent" as const,
  bgColor: "#ffffff",
  bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  bgImage: null,
};

export const DEFAULT_OBJECT_REMOVER_SETTINGS = {
  brushSize: 30,
};

export const DEFAULT_CLEANUP_SETTINGS = {
  noiseReduction: 30,
  sharpness: 20,
  scratchRemoval: false,
  brushSize: 10,
};

export const DEFAULT_COLORIZE_SETTINGS = {
  intensity: 70,
  saturation: 60,
  colorHints: [],
  referenceImage: null,
};
