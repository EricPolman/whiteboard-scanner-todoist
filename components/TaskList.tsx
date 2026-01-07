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
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Extracted Tasks ({selectedCount}/{lines.length} selected)
        </h2>
        <button
          onClick={toggleAll}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {selectedCount === lines.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="space-y-2">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
              line.selected
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={line.selected}
              onChange={() => toggleLine(line.id)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />

            {editingId === line.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(line.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(line.id)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-red-600 hover:bg-red-100 rounded"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="text-gray-800">{line.text}</p>
                  {line.confidence !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(line.confidence)}%
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(line)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteLine(line.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
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
