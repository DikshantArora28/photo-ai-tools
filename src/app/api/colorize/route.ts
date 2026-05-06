import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function tryGradioSpace(
  spaceName: string,
  imageBlob: Blob
): Promise<Blob | null> {
  try {
    // Step 1: Upload the file
    const uploadUrl = `https://${spaceName.replace("/", "-")}.hf.space/upload`;
    const uploadForm = new FormData();
    uploadForm.append("files", imageBlob, "input.jpg");

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok) return null;
    const uploadedFiles = await uploadRes.json();
    if (!uploadedFiles || !uploadedFiles[0]) return null;

    // Step 2: Call the predict API
    const apiUrl = `https://${spaceName.replace("/", "-")}.hf.space/api/predict`;
    const predictRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{ path: uploadedFiles[0], type: "image/jpeg" }],
      }),
    });

    if (!predictRes.ok) return null;
    const result = await predictRes.json();

    // Step 3: Extract the output image URL
    if (result?.data?.[0]) {
      const output = result.data[0];
      const imageUrl = typeof output === "string"
        ? output
        : output?.url || output?.path;

      if (imageUrl) {
        const fullUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `https://${spaceName.replace("/", "-")}.hf.space/file=${imageUrl}`;

        const imgRes = await fetch(fullUrl);
        if (imgRes.ok) return await imgRes.blob();
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function tryGradioClient(
  spaceName: string,
  imageBlob: Blob
): Promise<Blob | null> {
  try {
    const { Client } = await import("@gradio/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = await Client.connect(spaceName) as any;

    // Try different endpoint/param combinations
    const attempts = [
      () => client.predict("/predict", { input_image: imageBlob }),
      () => client.predict("/predict", [imageBlob]),
      () => client.predict(0, { input_image: imageBlob }),
      () => client.predict(0, [imageBlob]),
    ];

    for (const attempt of attempts) {
      try {
        const prediction = await attempt();
        const data = prediction?.data;
        if (data && Array.isArray(data) && data[0]) {
          const info = data[0];
          const url = typeof info === "string" ? info : info?.url || info?.path;
          if (url) {
            const res = await fetch(url);
            if (res.ok) return await res.blob();
          }
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type || "image/jpeg" });

    const spaces = [
      "marshmellow77/deoldify",
      "MemoonaTahira/Image_Colorizer",
    ];

    let result: Blob | null = null;

    // Try Gradio client approach first
    for (const space of spaces) {
      result = await tryGradioClient(space, blob);
      if (result) break;
    }

    // Fallback: try raw API approach
    if (!result) {
      for (const space of spaces) {
        result = await tryGradioSpace(space, blob);
        if (result) break;
      }
    }

    // Fallback: try HuggingFace Inference API with image-to-image model
    if (!result) {
      try {
        const hfToken = process.env.HF_TOKEN;
        const headers: Record<string, string> = {
          "Content-Type": "application/octet-stream",
        };
        if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

        const hfRes = await fetch(
          "https://api-inference.huggingface.co/models/ghoskno/Color-Canny-Controlnet-model",
          { method: "POST", headers, body: buffer }
        );
        if (hfRes.ok) {
          result = await hfRes.blob();
        }
      } catch {
        // continue
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "AI colorization service unavailable. Try again in a moment." },
        { status: 503 }
      );
    }

    const resultBuffer = await result.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Colorization error:", error);
    return NextResponse.json({ error: "Failed to colorize" }, { status: 500 });
  }
}
