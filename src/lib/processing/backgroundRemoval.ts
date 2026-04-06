import { removeBackground, type Config } from "@imgly/background-removal";

export interface BgRemovalProgress {
  phase: string;
  progress: number;
}

export async function removeImageBackground(
  imageBlob: Blob,
  onProgress?: (progress: BgRemovalProgress) => void
): Promise<Blob> {
  const config: Config = {
    progress: (key: string, current: number, total: number) => {
      const pct = total > 0 ? (current / total) * 100 : 0;
      let phase = "Processing";
      if (key.includes("download")) phase = "Downloading AI model";
      else if (key.includes("compute")) phase = "Removing background";
      onProgress?.({ phase, progress: pct });
    },
    output: {
      format: "image/png",
      quality: 1,
    },
  };

  const result = await removeBackground(imageBlob, config);
  return result;
}
