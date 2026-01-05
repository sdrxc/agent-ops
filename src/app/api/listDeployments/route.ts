import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";
import { Deployment } from "@/types/deployments";

const listDeploymentsPayloadSchema = z.object({
  userID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = listDeploymentsPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/listDeployments",
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

