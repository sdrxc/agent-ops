import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const step3ServerRegistrySchema = z.object({
  projectID: z.string(),
  sequenceID: z.string(),
  userID: z.string(),
  serverID: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const serverRegistryPayload = await request.json();
    const validated = step3ServerRegistrySchema.parse(serverRegistryPayload);
    console.log("Validated Payload:", validated);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/step3-serverRegistry",
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
