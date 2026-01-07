"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import ImageUpload from "@/components/ImageUpload";
import TaskList from "@/components/TaskList";
import ProjectSelector from "@/components/ProjectSelector";
import { ExtractedLine } from "@/types";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { processImageOCR } from "@/lib/ocr";

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
      // Process OCR on the client side for better privacy and performance
      const result = await processImageOCR(file, selectedProjectId || undefined);
      setLines(result.lines);

      if (result.lines.length === 0) {
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
        ...(line.section && { section: line.section }),
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              AI-Powered Task Extraction
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              Whiteboard<br/>Scanner
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Transform your whiteboard photos into organized Todoist tasks instantly
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-xl font-bold mb-4 text-slate-900">How it works</h2>
              <ol className="text-left space-y-3">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                    1
                  </span>
                  <div className="pt-1.5">
                    <span className="text-slate-800 font-medium text-lg block">Choose your project</span>
                    <span className="text-slate-600 text-sm">Select which Todoist project to add tasks to</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                    2
                  </span>
                  <div className="pt-1.5">
                    <span className="text-slate-800 font-medium text-lg block">Upload or capture</span>
                    <span className="text-slate-600 text-sm">Take a photo or upload an image of your whiteboard</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                    3
                  </span>
                  <div className="pt-1.5">
                    <span className="text-slate-800 font-medium text-lg block">AI extraction</span>
                    <span className="text-slate-600 text-sm">Our AI reads and extracts text from your image</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                    4
                  </span>
                  <div className="pt-1.5">
                    <span className="text-slate-800 font-medium text-lg block">Review & create</span>
                    <span className="text-slate-600 text-sm">Edit if needed, then add all tasks with one click</span>
                  </div>
                </li>
              </ol>
            </div>
            <button
              onClick={() => signIn("todoist")}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 active:scale-100"
            >
              Sign in with Todoist
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Whiteboard Scanner</h1>
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="text-xs sm:text-sm text-slate-600 font-medium hidden sm:inline truncate max-w-[150px] sm:max-w-none">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-xs sm:text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg sm:rounded-none hover:bg-slate-100 sm:hover:bg-transparent"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-safe">
        {success && (
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm flex items-start sm:items-center gap-3">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-emerald-900 font-semibold">Tasks created successfully!</p>
              <p className="text-xs sm:text-sm text-emerald-700">
                Check your Todoist project to see your new tasks.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Scan another
            </button>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-red-900 font-medium break-words">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl leading-none font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {!image && !success && (
          <>
            <div className="max-w-3xl mx-auto mb-4 sm:mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
                <ProjectSelector
                  selectedProjectId={selectedProjectId}
                  onProjectSelect={setSelectedProjectId}
                  disabled={processing}
                />
              </div>
            </div>
            {selectedProjectId && (
              <div className="mb-8">
                <ImageUpload onImageSelect={handleImageSelect} disabled={processing} />
              </div>
            )}
            {!selectedProjectId && (
              <div className="max-w-3xl mx-auto text-center p-6 sm:p-8 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                <p className="text-sm sm:text-base text-slate-500">Select a project above to continue</p>
              </div>
            )}
          </>
        )}

        {processing && (
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Loader2 className="relative w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mb-3 sm:mb-4" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Processing image...</p>
            <p className="text-xs sm:text-sm text-slate-500">This may take a few seconds</p>
          </div>
        )}

        {imagePreview && !processing && (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 lg:sticky lg:top-20">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3 px-1">Uploaded Image</h2>
                <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Whiteboard"
                    className="w-full"
                  />
                  {lines.length > 0 && (
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white/95 backdrop-blur-sm text-slate-700 rounded-lg shadow-lg hover:bg-white border border-slate-200 font-medium transition-all hover:shadow-xl"
                    >
                      Upload different image
                    </button>
                  )}
                </div>
              </div>

              {/* Task List Section */}
              {lines.length > 0 && (
                <div className="w-full lg:w-1/2">
                  <div className="mb-6 sm:mb-8">
                    <TaskList lines={lines} onLinesChange={setLines} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 sm:bottom-6 bg-slate-50 pb-4">
                    <button
                      onClick={handleReset}
                      disabled={creating}
                      className="w-full sm:flex-1 px-6 py-3.5 sm:py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 font-semibold shadow-sm text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTasks}
                      disabled={creating || !selectedProjectId || lines.filter(l => l.selected).length === 0}
                      className="w-full sm:flex-1 px-6 py-3.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 text-sm sm:text-base"
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
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
