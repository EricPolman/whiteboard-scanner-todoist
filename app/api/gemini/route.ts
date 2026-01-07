import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured on server" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const projectId = formData.get("projectId") as string | null;

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

    // Fetch sections if projectId is provided
    let sectionNames: string[] = [];
    if (projectId) {
      try {
        const session = await getServerSession(authOptions);
        if (session?.accessToken) {
          const todoistResponse = await fetch(
            `https://api.todoist.com/rest/v2/sections?project_id=${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );
          if (todoistResponse.ok) {
            const sections = await todoistResponse.json();
            sectionNames = sections.map((s: { name: string }) => s.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      }
    }

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
    let prompt = `You are a whiteboard text extraction assistant. 
    
Analyze this whiteboard image and extract ALL visible text lines.
Return the text in a JSON array format where each line is a separate item.
Each line should be a distinct task or item from the whiteboard.
Preserve the original order of the text as it appears on the whiteboard.
Leading - or • characters should be removed from the start of each line. A title line should not be included unless it looks like a task.
Fix casing errors.`;

    if (sectionNames.length > 0) {
      prompt += `\n\nThis appears to be a grocery list. Classify each item into the most relevant section from this list:
${sectionNames.map((name) => `- ${name}`).join("\n")}

Return ONLY a JSON array in this format with no additional text:
[{"text": "item name", "section": "${
        sectionNames[0]
      }"}, {"text": "item 2", "section": "${
        sectionNames[1] || sectionNames[0]
      }"}]`;
    } else {
      prompt += `\n\nReturn ONLY a JSON array of text strings with no additional text:
["task 1 text", "task 2 text"]`;
    }

    prompt += `\n\nIf no text is found, return an empty array: []`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let extractedLines: Array<string | { text: string; section?: string }> = [];
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

    // Convert to line format, handling both string and object formats
    const lines = extractedLines
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            id: `line-${index}`,
            text: item.trim(),
            selected: true,
          };
        } else {
          return {
            id: `line-${index}`,
            text: item.text.trim(),
            selected: true,
            section: item.section,
          };
        }
      })
      .filter((line) => line.text.length > 0);

    return NextResponse.json({
      lines,
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
