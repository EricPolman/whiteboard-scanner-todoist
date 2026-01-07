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
      <div className="flex items-center justify-center gap-2 p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-gray-600">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Todoist Project
      </label>
      <select
        id="project-select"
        value={selectedProjectId || ""}
        onChange={(e) => onProjectSelect(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select a project...</option>
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
