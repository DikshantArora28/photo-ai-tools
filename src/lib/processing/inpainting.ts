import { cloneImageData } from "@/lib/canvas/canvasUtils";

/**
 * Telea fast marching inpainting.
 * Fills masked regions using weighted average of boundary pixels.
 */
export function inpaint(
  imageData: ImageData,
  mask: ImageData,
  radius: number = 5
): ImageData {
  const result = cloneImageData(imageData);
  const { width, height } = result;
  const data = result.data;
  const maskData = mask.data;

  // Build binary mask: true = needs inpainting
  const needsFill = new Uint8Array(width * height);
  for (let i = 0; i < needsFill.length; i++) {
    // Use red channel of mask (painted white = needs fill)
    needsFill[i] = maskData[i * 4] > 128 ? 1 : 0;
  }

  // Distance transform for ordering
  const dist = new Float32Array(width * height);
  dist.fill(Infinity);

  // Priority queue using array + sort (simple but effective for typical mask sizes)
  const queue: Array<{ x: number; y: number; d: number }> = [];

  // Initialize: find boundary pixels (filled neighbors of mask)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (needsFill[y * width + x] === 0) {
        dist[y * width + x] = 0;
        // Check if adjacent to mask
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (needsFill[ny * width + nx] === 1 && dist[ny * width + nx] === Infinity) {
              dist[ny * width + nx] = 1;
              queue.push({ x: nx, y: ny, d: 1 });
            }
          }
        }
      }
    }
  }

  // Sort by distance
  queue.sort((a, b) => a.d - b.d);

  // Process queue
  let idx = 0;
  while (idx < queue.length) {
    const { x, y } = queue[idx];
    idx++;

    if (needsFill[y * width + x] === 0) continue;

    // Weighted average of known neighbors within radius
    let totalWeight = 0;
    let sumR = 0, sumG = 0, sumB = 0;

    for (let ky = -radius; ky <= radius; ky++) {
      for (let kx = -radius; kx <= radius; kx++) {
        const nx = x + kx;
        const ny = y + ky;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (needsFill[ny * width + nx] === 1) continue;

        const d2 = kx * kx + ky * ky;
        if (d2 > radius * radius) continue;

        const weight = 1 / (1 + Math.sqrt(d2));
        const nIdx = (ny * width + nx) * 4;

        sumR += data[nIdx] * weight;
        sumG += data[nIdx + 1] * weight;
        sumB += data[nIdx + 2] * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      const pIdx = (y * width + x) * 4;
      data[pIdx] = Math.round(sumR / totalWeight);
      data[pIdx + 1] = Math.round(sumG / totalWeight);
      data[pIdx + 2] = Math.round(sumB / totalWeight);
      data[pIdx + 3] = 255;
    }

    needsFill[y * width + x] = 0;

    // Add neighbors to queue
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (needsFill[ny * width + nx] === 1) {
          const newDist = dist[y * width + x] + 1;
          if (newDist < dist[ny * width + nx]) {
            dist[ny * width + nx] = newDist;
            queue.push({ x: nx, y: ny, d: newDist });
          }
        }
      }
    }
  }

  return result;
}
