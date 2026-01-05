import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const UserDetailsPayloadSchema = z.object({
  userEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = UserDetailsPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/userDetails",
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