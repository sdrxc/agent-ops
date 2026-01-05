import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { mockDatabase } from "@/lib/mockDatabase";
import response from "./response.json";

const setupProjectPayloadSchema = z.object({
  projectName: z
    .string()
    .min(3, "Project name must be at least 3 characters long."),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters.")
    .optional(),
  createdBy: z.string(),
  tags: z.array(z.string()).optional(),
  enableMemoryManagement: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const validatedPayload = setupProjectPayloadSchema.parse(projectData);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const project = mockDatabase.createProject({
        projectName: validatedPayload.projectName,
        description: validatedPayload.description || "",
        createdBy: validatedPayload.createdBy,
        tags: validatedPayload.tags,
        enableMemoryManagement: validatedPayload.enableMemoryManagement,
      });

      console.log(
        "✅ Created project in mock DB:",
        project.projectID,
        project.projectName
      );

      return NextResponse.json({
        status: 200,
        message: "Project Created Successfully",
        data: {
          projectID: project.projectID,
        },
      });
    }

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/create-project",
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
