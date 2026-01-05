import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { mockDatabase } from "@/lib/mockDatabase";
import response from "./response.json";

const listAgentsPayloadSchema = z.object({
  userID: z.string(),
  projectID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = listAgentsPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const agents = mockDatabase.listProjectAgents(validatedPayload.projectID);

      console.log(
        "📋 Listing agents from mock DB for project",
        validatedPayload.projectID,
        ":",
        agents.length,
        "agents"
      );

      return NextResponse.json({
        status: 200,
        message: "Agents fetched successfully",
        data: {
          agents,
        },
      });
    }

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/listProjectAgents",
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
