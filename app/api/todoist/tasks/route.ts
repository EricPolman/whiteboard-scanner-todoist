import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { TodoistClient } from "@/lib/todoist";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tasks, projectId } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks array" },
        { status: 400 }
      );
    }

    const client = new TodoistClient(session.accessToken);

    // Add project_id to each task if provided
    const tasksWithProject = tasks.map(
      (task: { content: string; project_id?: string }) => ({
        ...task,
        project_id: projectId || task.project_id,
      })
    );

    const results = await client.createTasks(tasksWithProject);

    // Check if any tasks failed
    const failed = results.filter((r) => !r.success);
    const succeeded = results.filter((r) => r.success);

    return NextResponse.json({
      success: failed.length === 0,
      created: succeeded.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    console.error("Error creating tasks:", error);
    return NextResponse.json(
      { error: "Failed to create tasks" },
      { status: 500 }
    );
  }
}
