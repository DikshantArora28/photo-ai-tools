import { createCanvas, getContext } from "@/lib/canvas/canvasUtils";
import { loadImage } from "@/lib/utils/imageConversion";

export type BgReplaceType = "transparent" | "color" | "gradient" | "image";

export interface BgReplaceOptions {
  type: BgReplaceType;
  color?: string;
  gradient?: string;
  imageSrc?: string;
}

export async function replaceBackground(
  foregroundCanvas: HTMLCanvasElement,
  options: BgReplaceOptions
): Promise<HTMLCanvasElement> {
  const { width, height } = foregroundCanvas;
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);

  if (options.type === "transparent") {
    ctx.drawImage(foregroundCanvas, 0, 0);
    return canvas;
  }

  if (options.type === "color" && options.color) {
    ctx.fillStyle = options.color;
    ctx.fillRect(0, 0, width, height);
  } else if (options.type === "gradient" && options.gradient) {
    drawGradient(ctx, options.gradient, width, height);
  } else if (options.type === "image" && options.imageSrc) {
    const bgImg = await loadImage(options.imageSrc);
    const scale = Math.max(width / bgImg.naturalWidth, height / bgImg.naturalHeight);
    const sw = bgImg.naturalWidth * scale;
    const sh = bgImg.naturalHeight * scale;
    ctx.drawImage(bgImg, (width - sw) / 2, (height - sh) / 2, sw, sh);
  }

  ctx.drawImage(foregroundCanvas, 0, 0);
  return canvas;
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  css: string,
  width: number,
  height: number
) {
  const match = css.match(
    /linear-gradient\(\s*(\d+)deg\s*,\s*(#[a-fA-F0-9]{3,8})\s+\d+%\s*,\s*(#[a-fA-F0-9]{3,8})\s+\d+%\s*\)/
  );

  if (!match) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const angle = (parseInt(match[1]) * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const len = Math.sqrt(width * width + height * height) / 2;

  const grad = ctx.createLinearGradient(
    cx - Math.sin(angle) * len,
    cy - Math.cos(angle) * len,
    cx + Math.sin(angle) * len,
    cy + Math.cos(angle) * len
  );

  grad.addColorStop(0, match[2]);
  grad.addColorStop(1, match[3]);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
