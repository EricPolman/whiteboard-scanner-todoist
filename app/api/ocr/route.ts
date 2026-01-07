import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are supported." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Initialize Tesseract worker
    const worker = await createWorker("eng");

    // Perform OCR
    const { data } = await worker.recognize(buffer);

    await worker.terminate();

    const processingTime = Date.now() - startTime;

    // Extract lines and filter out empty ones
    // @ts-expect-error - Tesseract.js types are incomplete
    const lines = (data.lines || [])
      .map((line: { text: string; confidence: number }, index: number) => ({
        id: `line-${index}`,
        text: line.text.trim(),
        selected: true,
        confidence: line.confidence,
      }))
      .filter((line: { text: string }) => line.text.length > 0);

    return NextResponse.json({
      lines,
      confidence: data.confidence,
      processingTime,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
