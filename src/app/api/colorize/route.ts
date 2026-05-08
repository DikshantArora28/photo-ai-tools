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
        { error: "REPLICATE_API_TOKEN not configured. Add billing at replicate.com/account/billing to activate." },
        { status: 503 }
      );
    }

    // Convert file to base64 data URI
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${base64}`;

    const replicate = new Replicate({ auth: token });

    // DeOldify Artistic model — correct version ID verified by API
    const output = await replicate.run(
      "arielreplicate/deoldify_image:0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950",
      {
        input: {
          input_image: dataUri,
          model_name: "Artistic",
          render_factor: 35,
        },
      }
    );

    // Output is a URL string or ReadableStream
    let outputUrl: string;
    if (typeof output === "string") {
      outputUrl = output;
    } else if (output && typeof output === "object" && "url" in output) {
      outputUrl = String((output as { url: string }).url);
    } else {
      outputUrl = String(output);
    }

    if (!outputUrl || !outputUrl.startsWith("http")) {
      return NextResponse.json({ error: "Unexpected model output" }, { status: 500 });
    }

    const imageRes = await fetch(outputUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to download colorized image" }, { status: 500 });
    }

    const resultBuffer = await imageRes.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Colorization error:", error);
    const msg = error instanceof Error ? error.message : "Failed to colorize";
    // Check for payment error specifically
    if (msg.includes("402") || msg.includes("credit") || msg.includes("Payment")) {
      return NextResponse.json(
        { error: "Replicate needs billing activated. Go to replicate.com/account/billing to add a card ($5 free credits)." },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
