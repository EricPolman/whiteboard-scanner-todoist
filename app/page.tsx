"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import ImageUpload from "@/components/ImageUpload";
import TaskList from "@/components/TaskList";
import ProjectSelector from "@/components/ProjectSelector";
import { ExtractedLine } from "@/types";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lines, setLines] = useState<ExtractedLine[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageSelect = async (file: File) => {
    setImage(file);
    setError(null);
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Process OCR
    await processOCR(file);
  };

  const processOCR = async (file: File) => {
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process image");
      }

      const data = await response.json();
      setLines(data.lines);

      if (data.lines.length === 0) {
        setError("No text detected in the image. Please try a clearer photo.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!selectedProjectId) {
      setError("Please select a project");
      return;
    }

    const selectedLines = lines.filter((line) => line.selected);
    if (selectedLines.length === 0) {
      setError("Please select at least one task");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const tasks = selectedLines.map((line) => ({
        content: line.text,
      }));

      const response = await fetch("/api/todoist/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          projectId: selectedProjectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tasks");
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setLines([]);
        setImage(null);
        setImagePreview(null);
      } else {
        setError(
          `Created ${result.created} tasks, but ${result.failed} failed. Please try again.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tasks");
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setLines([]);
    setError(null);
    setSuccess(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Whiteboard Scanner
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Scan your whiteboard and automatically create tasks in Todoist
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">How it works:</h2>
              <ol className="text-left space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </span>
                  <span className="text-gray-700 pt-1">
                    Upload or capture a photo of your whiteboard
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </span>
                  <span className="text-gray-700 pt-1">
                    AI extracts text lines from the image
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                  <span className="text-gray-700 pt-1">
                    Review and edit the extracted tasks
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </span>
                  <span className="text-gray-700 pt-1">
                    Create all tasks in your Todoist project with one click
                  </span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => signIn("todoist")}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Sign in with Todoist
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Whiteboard Scanner</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {success && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Tasks created successfully!</p>
              <p className="text-sm text-green-700">
                Check your Todoist project to see your new tasks.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-green-600 hover:text-green-700 underline"
            >
              Scan another
            </button>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {!image && !success && (
          <div className="mb-8">
            <ImageUpload onImageSelect={handleImageSelect} disabled={processing} />
          </div>
        )}

        {imagePreview && (
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-lg font-semibold mb-4">Uploaded Image</h2>
            <div className="relative">
              <img
                src={imagePreview}
                alt="Whiteboard"
                className="w-full rounded-lg shadow-lg"
              />
              {!processing && lines.length > 0 && (
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100"
                >
                  Upload different image
                </button>
              )}
            </div>
          </div>
        )}

        {processing && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-gray-600">Processing image...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        )}

        {!processing && lines.length > 0 && (
          <>
            <div className="mb-8">
              <TaskList lines={lines} onLinesChange={setLines} />
            </div>

            <div className="max-w-3xl mx-auto mb-8">
              <ProjectSelector
                selectedProjectId={selectedProjectId}
                onProjectSelect={setSelectedProjectId}
                disabled={creating}
              />
            </div>

            <div className="max-w-3xl mx-auto flex gap-4">
              <button
                onClick={handleReset}
                disabled={creating}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTasks}
                disabled={creating || !selectedProjectId || lines.filter(l => l.selected).length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Tasks...
                  </>
                ) : (
                  `Create ${lines.filter(l => l.selected).length} Tasks`
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
