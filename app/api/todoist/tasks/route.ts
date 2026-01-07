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

    // Fetch sections to map section names to IDs
    const hasSections = tasks.some(
      (task: { section?: string }) => task.section
    );
    let sectionMap: Record<string, string> = {};

    if (hasSections && projectId) {
      try {
        const sections = await client.getSections(projectId);
        // Create exact name map (case-sensitive since Gemini uses exact names)
        sectionMap = sections.reduce((map, section) => {
          map[section.name] = section.id;
          return map;
        }, {} as Record<string, string>);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    }

    // Add project_id and section_id to each task
    const tasksWithProject = tasks.map(
      (task: { content: string; project_id?: string; section?: string }) => {
        const taskData: {
          content: string;
          project_id?: string;
          section_id?: string;
          section?: string;
        } = {
          ...task,
          project_id: projectId || task.project_id,
        };

        // Map exact section name to section_id
        if (task.section && sectionMap[task.section]) {
          taskData.section_id = sectionMap[task.section];
        }

        // Remove the section field as it's not part of Todoist API
        delete taskData.section;

        return taskData;
      }
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
