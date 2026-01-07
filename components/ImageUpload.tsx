"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all bg-white shadow-sm ${
          dragActive
            ? "border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-lg scale-[1.02]"
            : "border-slate-300 hover:border-slate-400 hover:shadow-md"
        } ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-3 sm:mb-4 transition-colors ${
          dragActive ? "bg-blue-100" : "bg-slate-100"
        }`}>
          <Upload className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
            dragActive ? "text-blue-600" : "text-slate-500"
          }`} />
        </div>
        <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
          Drop your whiteboard image here
        </p>
        <p className="text-xs sm:text-sm text-slate-600">
          or click to browse your files
        </p>
        <p className="text-xs text-slate-500 mt-3">
          Supports JPEG, PNG, WebP (max 10MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex-1 h-px bg-slate-300"></div>
        <span className="text-sm font-medium text-slate-500">or</span>
        <div className="flex-1 h-px bg-slate-300"></div>
      </div>

      <button
        onClick={() => !disabled && cameraInputRef.current?.click()}
        disabled={disabled}
        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-semibold text-sm sm:text-base"
      >
        <Camera className="w-5 h-5" />
        Take Photo
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}
