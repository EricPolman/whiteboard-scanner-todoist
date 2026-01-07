import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured on server" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, and WebP are supported.",
        },
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

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Convert file to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: image.type,
      },
    };

    // Prompt Gemini to extract text line by line
    const prompt = `You are a whiteboard text extraction assistant. 
    
Analyze this whiteboard image and extract ALL visible text lines.
Return the text in a JSON array format where each line is a separate item.
Each line should be a distinct task or item from the whiteboard.
Preserve the original order of the text as it appears on the whiteboard.
Leading - or • characters should be removed from the start of each line. A title line should not be included unless it looks like a task.
Fix casing errors.

Return ONLY a JSON array in this exact format with no additional text:
["line 1 text", "line 2 text", "line 3 text"]

If no text is found, return an empty array: []`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let extractedLines: string[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedLines = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse extracted text. Please try again." },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;

    // Convert to line format
    const lines = extractedLines
      .map((text, index) => ({
        id: `line-${index}`,
        text: text.trim(),
        selected: true,
        confidence: 95,
      }))
      .filter((line) => line.text.length > 0);

    return NextResponse.json({
      lines,
      confidence: 95,
      processingTime,
    });
  } catch (error) {
    console.error("Gemini processing error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process image",
      },
      { status: 500 }
    );
  }
}
