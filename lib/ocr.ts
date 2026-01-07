"use client";

import { ExtractedLine } from "@/types";

export async function processImageOCR(file: File): Promise<{
  lines: ExtractedLine[];
  confidence: number;
  processingTime: number;
}> {
  try {
    // Send image to server-side API to keep API key secure
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/gemini", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to process image");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gemini processing error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to process image. Please try again.");
  }
}
