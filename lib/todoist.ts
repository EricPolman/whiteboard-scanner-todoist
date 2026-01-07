import { TodoistProject } from "@/types";

const TODOIST_API_BASE = "https://api.todoist.com/rest/v2";

export class TodoistClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${TODOIST_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Todoist API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getProjects(): Promise<TodoistProject[]> {
    return this.request<TodoistProject[]>("/projects");
  }

  async createTask(task: {
    content: string;
    project_id?: string;
    description?: string;
    priority?: number;
    due_string?: string;
  }): Promise<unknown> {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async createTasks(
    tasks: Array<{
      content: string;
      project_id?: string;
      description?: string;
      priority?: number;
      due_string?: string;
    }>
  ): Promise<Array<{ success: boolean; task?: unknown; error?: string }>> {
    // Create tasks sequentially to avoid rate limits
    const results = [];
    for (const task of tasks) {
      try {
        const result = await this.createTask(task);
        results.push({ success: true, task: result });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          task,
        });
      }
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return results;
  }
}
