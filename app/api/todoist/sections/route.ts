import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TodoistClient } from "@/lib/todoist";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const client = new TodoistClient(session.accessToken);
    const sections = await client.getSections(projectId);

    console.log("Fetched sections:", sections);

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch sections",
      },
      { status: 500 }
    );
  }
}
