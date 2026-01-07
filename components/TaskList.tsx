"use client";

import { useState } from "react";
import { ExtractedLine } from "@/types";
import { Check, X, Edit2, Trash2 } from "lucide-react";

interface TaskListProps {
  lines: ExtractedLine[];
  onLinesChange: (lines: ExtractedLine[]) => void;
}

export default function TaskList({ lines, onLinesChange }: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const toggleLine = (id: string) => {
    onLinesChange(
      lines.map((line) =>
        line.id === id ? { ...line, selected: !line.selected } : line
      )
    );
  };

  const startEdit = (line: ExtractedLine) => {
    setEditingId(line.id);
    setEditText(line.text);
  };

  const saveEdit = (id: string) => {
    onLinesChange(
      lines.map((line) =>
        line.id === id ? { ...line, text: editText.trim() } : line
      )
    );
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const deleteLine = (id: string) => {
    onLinesChange(lines.filter((line) => line.id !== id));
  };

  const toggleAll = () => {
    const allSelected = lines.every((line) => line.selected);
    onLinesChange(
      lines.map((line) => ({ ...line, selected: !allSelected }))
    );
  };

  const selectedCount = lines.filter((line) => line.selected).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            <span className="hidden sm:inline">Extracted Tasks</span>
            <span className="sm:hidden">Tasks</span>
            <span className="ml-2 text-sm sm:text-base font-semibold text-slate-500">({selectedCount}/{lines.length})</span>
          </h2>
          <button
            onClick={toggleAll}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            {selectedCount === lines.length ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
              line.selected
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={line.selected}
              onChange={() => toggleLine(line.id)}
              className="mt-0.5 sm:mt-1 w-5 h-5 sm:w-5 sm:h-5 text-blue-600 rounded-md focus:ring-blue-500 focus:ring-2 cursor-pointer flex-shrink-0"
            />

            {editingId === line.id ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(line.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(line.id)}
                  className="p-2.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-slate-900 font-medium text-sm sm:text-base break-words">{line.text}</p>
                    {line.section && (
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                        {line.section}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(line)}
                    className="p-2 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteLine(line.id)}
                    className="p-2 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors touch-manipulation"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {lines.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks extracted. Try uploading a different image.
        </div>
      )}
    </div>
  );
}
