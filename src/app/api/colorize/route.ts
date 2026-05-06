import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    // Try multiple HuggingFace Spaces for colorization
    const spaces = [
      { name: "marshmellow77/deoldify", endpoint: "/predict", paramKey: "input_image" },
      { name: "kevinwang676/Image-Colorization", endpoint: "/predict", paramKey: "input_image" },
    ];

    let result: Blob | null = null;

    for (const space of spaces) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = await Client.connect(space.name) as any;

        // Try named parameter first
        let prediction;
        try {
          prediction = await client.predict(space.endpoint, {
            [space.paramKey]: blob,
          });
        } catch {
          // Try positional parameter
          prediction = await client.predict(space.endpoint, [blob]);
        }

        const data = prediction?.data;
        if (data && Array.isArray(data) && data[0]) {
          const imageInfo = data[0];
          const imageUrl = typeof imageInfo === "string"
            ? imageInfo
            : imageInfo?.url || imageInfo?.path;

          if (imageUrl) {
            const response = await fetch(imageUrl);
            if (response.ok) {
              result = await response.blob();
              break;
            }
          }
        }
      } catch (err) {
        console.log(`Space ${space.name} failed:`, err);
        continue;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "AI colorization service is temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

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
