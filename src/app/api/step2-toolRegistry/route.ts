import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const toolSchema = z.object({
  toolID: z.string(),
  toolName: z.string(),
});

const step2ToolRegistrySchema = z.object({
  projectID: z.string(),
  sequenceID: z.string(),
  userID: z.string(),
  selectedToolData: z.array(toolSchema)
});

export async function POST(request: NextRequest) {
  try {
    const toolRegistryPayload = await request.json();
    const validated = step2ToolRegistrySchema.parse(toolRegistryPayload);
    console.log("Validated Payload:", validated);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/step2-toolRegistry",
        data: validated,
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
