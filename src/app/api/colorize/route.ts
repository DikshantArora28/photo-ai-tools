import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const maxDuration = 60; // Allow up to 60s for AI processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert File to Blob for Gradio
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    // Connect to DeOldify colorization space on HuggingFace
    // Try multiple spaces as fallback
    const spaces = [
      "marshmellow77/deoldify",
      "kevinwang676/Image-Colorization",
    ];

    let result: Blob | null = null;

    for (const space of spaces) {
      try {
        const client = await Client.connect(space, {
          hf_token: process.env.HF_TOKEN as `hf_${string}` | undefined,
        });

        const prediction = await client.predict("/predict", {
          input_image: blob,
        });

        // Extract the image from the result
        const data = prediction.data as Array<{ url?: string; path?: string }>;
        if (data && data[0]) {
          const imageInfo = data[0];
          const imageUrl = imageInfo.url || imageInfo.path;
          if (imageUrl) {
            const response = await fetch(imageUrl);
            if (response.ok) {
              result = await response.blob();
              break;
            }
          }
        }
      } catch (err) {
        console.log(`Space ${space} failed, trying next...`, err);
        continue;
      }
    }

    if (!result) {
      // Fallback: try with different API endpoint name
      try {
        const client = await Client.connect("marshmellow77/deoldify", {
          hf_token: process.env.HF_TOKEN as `hf_${string}` | undefined,
        });

        const prediction = await client.predict(0, [blob]);

        const data = prediction.data as Array<{ url?: string; path?: string }>;
        if (data && data[0]) {
          const imageInfo = data[0];
          const imageUrl = imageInfo.url || imageInfo.path;
          if (imageUrl) {
            const response = await fetch(imageUrl);
            if (response.ok) {
              result = await response.blob();
            }
          }
        }
      } catch (err) {
        console.log("Fallback also failed:", err);
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "AI colorization service is temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    // Return the colorized image
    const resultBuffer = await result.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Colorization error:", error);
    return NextResponse.json(
      { error: "Failed to colorize image. Please try again." },
      { status: 500 }
    );
  }
}
