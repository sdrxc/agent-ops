import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { mockDatabase } from "@/lib/mockDatabase";
import response from "./response.json";

const setupProjectPayloadSchema = z.object({
  userID: z.string(),
  projectID: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const validatedPayload = setupProjectPayloadSchema.parse(projectData);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const agent = mockDatabase.registerAgent({
        projectID: validatedPayload.projectID,
        name: validatedPayload.name,
        description: validatedPayload.description,
        tags: validatedPayload.tags || [],
      });

      console.log(
        "✅ Registered agent in mock DB:",
        agent.id,
        agent.name,
        "for project",
        validatedPayload.projectID
      );

      return NextResponse.json({
        status: 200,
        message: "Agent registered successfully",
        data: {
          agent,
        },
      });
    }

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/registerNewAgent",
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
