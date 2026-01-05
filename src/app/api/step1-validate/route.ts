import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const step1AgentRegistrySchema = z.object({
  sequenceID: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = step1AgentRegistrySchema.parse(body);
    console.log("Validated Payload:", validated);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/step1-validate",
        data: validated,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: "Invalid payload", error: error.errors },
        { status: 400 }
      );
    }
    console.error("❌ Unexpected error, using mock data:", error);
    return NextResponse.json(response);
  }
}
