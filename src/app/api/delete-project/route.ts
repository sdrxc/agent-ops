import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { mockDatabase } from "@/lib/mockDatabase";
import response from "./response.json";

const deleteProjectPayloadSchema = z.object({
  projectID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const validatedPayload = deleteProjectPayloadSchema.parse(projectData);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const success = mockDatabase.deleteProject(validatedPayload.projectID);

      if (!success) {
        return NextResponse.json(
          { status: 404, message: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: 200,
        message: "Project Deleted Successfully",
      });
    }

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/delete-project",
        data: validatedPayload,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("❌ Unexpected error, using mock data:", error);
    return NextResponse.json(response);
  }
}
