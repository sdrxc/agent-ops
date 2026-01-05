import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const step4CodeUploadSchema = z.object({
  projectID: z.string(),
  sequenceID: z.string(),
  userID: z.string(),
  repoUrl: z.string(),
  branch: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const codeUploadPayload = await request.json();
    const validatedPayload = step4CodeUploadSchema.parse(codeUploadPayload);
    console.log("Validated Payload:", validatedPayload);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/step4-codeUpload",
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
