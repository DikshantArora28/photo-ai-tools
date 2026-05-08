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

    // Use DeOldify model for colorization — same model powering professional tools
    const output = await replicate.run(
      "arielreplicate/deoldify_image:0da600fab0c45a66211339f1c16b71345d22f26ef5e48f55c17511b96a08f40f",
      {
        input: {
          input_image: dataUri,
          model_name: "Artistic",
          render_factor: 35,
        },
      }
    );

    // Output is a URL string to the colorized image
    const outputUrl = typeof output === "string" ? output : String(output);

    if (!outputUrl || !outputUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "Unexpected model output" },
        { status: 500 }
      );
    }

    // Fetch the result image and return it
    const imageRes = await fetch(outputUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Failed to download colorized image" },
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
    console.error("Colorization error:", error);
    const message = error instanceof Error ? error.message : "Failed to colorize";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
