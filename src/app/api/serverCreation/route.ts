import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const serverCreationSchema = z.object({
  userID: z.string(),
  projectID: z.string(),
  activeData: z.record(z.any())
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = serverCreationSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/serverCreation",
        data: validatedPayload,
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
