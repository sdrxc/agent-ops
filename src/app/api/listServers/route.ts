import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

// Define schema for incoming request payload
const listServerPayloadSchema = z.object({
  userID: z.string(),
  projectID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = listServerPayloadSchema.parse(body);
    console.log("Validated Payload:", validated);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/listServers",
        data: validated,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    // Return mock data as fallback for other errors
    console.error("❌ Unexpected error, using mock data:", error);
    return NextResponse.json(response);
  }
}
