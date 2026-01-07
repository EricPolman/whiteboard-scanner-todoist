"use client";

import { useEffect, useState } from "react";
import { TodoistProject } from "@/types";
import { Loader2 } from "lucide-react";

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  disabled?: boolean;
}

export default function ProjectSelector({
  selectedProjectId,
  onProjectSelect,
  disabled,
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<TodoistProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/todoist/projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);

      // Auto-select inbox project if available
      const inbox = data.find((p: TodoistProject) => p.is_inbox_project);
      if (inbox && !selectedProjectId) {
        onProjectSelect(inbox.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-slate-600 font-medium">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="project-select" className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
        Select Todoist Project
      </label>
      <select
        id="project-select"
        value={selectedProjectId || ""}
        onChange={(e) => onProjectSelect(e.target.value)}
        disabled={disabled}
        className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-900 font-medium shadow-sm hover:border-slate-400 transition-colors text-sm sm:text-base"
      >
        <option value="" className="text-slate-500">Choose a project...</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.is_inbox_project ? "📥 " : ""}
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
