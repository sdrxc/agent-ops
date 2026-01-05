import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { mockDatabase } from "@/lib/mockDatabase";
import response from "./response.json";

const updateProjectPayloadSchema = z.object({
  projectID: z.string(),
  projectName: z
    .string()
    .min(3, "Project name must be at least 3 characters long."),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters.")
    .optional(),
  tags: z.array(z.string()).optional(),
  enableMemoryManagement: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const validatedPayload = updateProjectPayloadSchema.parse(projectData);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const project = mockDatabase.updateProject(validatedPayload.projectID, {
        projectName: validatedPayload.projectName,
        description: validatedPayload.description,
        tags: validatedPayload.tags,
        enableMemoryManagement: validatedPayload.enableMemoryManagement,
      });

      if (!project) {
        return NextResponse.json(
          { status: 404, message: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: 200,
        message: "Project Updated Successfully",
        data: {
          projectID: project.projectID,
        },
      });
    }

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/update-project",
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
