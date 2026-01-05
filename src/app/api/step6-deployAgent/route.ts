import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const step6AgentDeploymentSchema = z.object({
  sequenceID: z.string(),
  userID: z.string(),
  projectID: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const agentDeploymentPayload = await request.json();
    const validatedPayload = step6AgentDeploymentSchema.parse(agentDeploymentPayload);
    console.log("Validated Payload:", validatedPayload);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/step6-deployAgent",
        data: validatedPayload,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("❌ Unexpected error, using mock data:", error);
    return NextResponse.json(response);
  }
}
