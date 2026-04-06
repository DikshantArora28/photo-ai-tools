import { createCanvas, getContext } from "./canvasUtils";

export function compositeOnBackground(
  foreground: HTMLCanvasElement,
  bgType: "color" | "gradient" | "image",
  bgValue: string,
  bgImage?: HTMLImageElement
): HTMLCanvasElement {
  const { width, height } = foreground;
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);

  switch (bgType) {
    case "color":
      ctx.fillStyle = bgValue;
      ctx.fillRect(0, 0, width, height);
      break;

    case "gradient": {
      const parsed = parseGradient(bgValue, width, height);
      if (parsed) {
        ctx.fillStyle = parsed;
        ctx.fillRect(0, 0, width, height);
      }
      break;
    }

    case "image":
      if (bgImage) {
        const scale = Math.max(width / bgImage.naturalWidth, height / bgImage.naturalHeight);
        const sw = bgImage.naturalWidth * scale;
        const sh = bgImage.naturalHeight * scale;
        ctx.drawImage(bgImage, (width - sw) / 2, (height - sh) / 2, sw, sh);
      }
      break;
  }

  ctx.drawImage(foreground, 0, 0);
  return canvas;
}

function parseGradient(
  css: string,
  width: number,
  height: number
): CanvasGradient | null {
  const canvas = createCanvas(1, 1);
  const ctx = getContext(canvas);

  // Simple linear gradient parser for common format:
  // linear-gradient(135deg, #color1 0%, #color2 100%)
  const match = css.match(
    /linear-gradient\(\s*(\d+)deg\s*,\s*(#[a-fA-F0-9]{3,8})\s+\d+%\s*,\s*(#[a-fA-F0-9]{3,8})\s+\d+%\s*\)/
  );

  if (!match) return null;

  const angle = (parseInt(match[1]) * Math.PI) / 180;
  const color1 = match[2];
  const color2 = match[3];

  const cx = width / 2;
  const cy = height / 2;
  const len = Math.sqrt(width * width + height * height) / 2;

  const grad = ctx.createLinearGradient(
    cx - Math.sin(angle) * len,
    cy - Math.cos(angle) * len,
    cx + Math.sin(angle) * len,
    cy + Math.cos(angle) * len
  );

  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);

  return grad;
}
