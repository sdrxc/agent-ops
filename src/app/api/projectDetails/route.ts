import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { mockDatabase } from "@/lib/mockDatabase";
import response from "./response.json";

const projectDetailsPayloadSchema = z.object({
  projectID: z.string(),
  userID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = projectDetailsPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const project = mockDatabase.getProject(validatedPayload.projectID);

      if (!project) {
        return NextResponse.json(
          { status: 404, message: "Project not found" },
          { status: 404 }
        );
      }

      console.log(
        "📖 Fetched project from mock DB:",
        project.projectID,
        project.projectName
      );

      return NextResponse.json({
        status: 200,
        message: "Project details fetched successfully",
        data: {
          project,
        },
      });
    }

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/projectDetails",
        data: validatedPayload,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/projectDetails:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(response);
  }
}
