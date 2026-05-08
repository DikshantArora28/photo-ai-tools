import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN not configured" },
        { status: 503 }
      );
    }

    // Convert file to base64 data URI
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${base64}`;

    const replicate = new Replicate({ auth: token });

    // Use Real-ESRGAN for AI upscaling and enhancement
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      {
        input: {
          image: dataUri,
          scale: 4,
          face_enhance: true,
        },
      }
    );

    const outputUrl = typeof output === "string" ? output : String(output);

    if (!outputUrl || !outputUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "Unexpected model output" },
        { status: 500 }
      );
    }

    const imageRes = await fetch(outputUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Failed to download enhanced image" },
        { status: 500 }
      );
    }

    const resultBuffer = await imageRes.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    const message = error instanceof Error ? error.message : "Failed to enhance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
