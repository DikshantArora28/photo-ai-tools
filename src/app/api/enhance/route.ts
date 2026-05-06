import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function tryHuggingFaceInference(
  modelId: string,
  imageBuffer: ArrayBuffer
): Promise<Blob | null> {
  try {
    const headers: Record<string, string> = {};
    const hfToken = process.env.HF_TOKEN;
    if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

    const res = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: "POST",
        headers,
        body: imageBuffer,
      }
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        return await res.blob();
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function tryGradioSpace(
  spaceName: string,
  imageBlob: Blob
): Promise<Blob | null> {
  try {
    const { Client } = await import("@gradio/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = await Client.connect(spaceName) as any;

    const attempts = [
      () => client.predict("/predict", { image: imageBlob }),
      () => client.predict("/predict", [imageBlob]),
      () => client.predict(0, [imageBlob]),
      () => client.predict("/predict", { input_image: imageBlob }),
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

    let result: Blob | null = null;

    // Try HuggingFace Inference API with super-resolution models
    const models = [
      "caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr",
      "eugenesiow/edsr-base",
    ];

    for (const model of models) {
      result = await tryHuggingFaceInference(model, buffer);
      if (result) break;
    }

    // Fallback: try Gradio spaces
    if (!result) {
      const spaces = [
        "nightfury/Real_ESRGAN",
        "sberbank-ai/Real-ESRGAN",
      ];
      for (const space of spaces) {
        result = await tryGradioSpace(space, blob);
        if (result) break;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "AI enhancement service unavailable. Try again in a moment." },
        { status: 503 }
      );
    }

    const resultBuffer = await result.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json({ error: "Failed to enhance" }, { status: 500 });
  }
}
