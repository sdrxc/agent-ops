import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const listSessionsPayloadSchema = z.object({
  userID: z.string().optional(),
  projectID: z.string().optional(),
  environment: z.enum(["dev", "qa", "prod"]).optional(),
  timeRange: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = listSessionsPayloadSchema.parse(body);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/sessions",
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

export async function GET(request: NextRequest) {
  try {
    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: "/api/sessions",
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Unexpected error, using mock data:", error);
    return NextResponse.json(response);
  }
}

