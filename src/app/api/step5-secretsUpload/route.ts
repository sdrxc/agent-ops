import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

const keyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const step5SecretsUploadSchema = z.object({
  projectID: z.string(),
  sequenceID: z.string(),
  userID: z.string(),
  form: z.array(keyValueSchema)
});

export async function POST(request: NextRequest) {
  try {
    const secretsUploadPayload = await request.json();
    const validatedPayload = step5SecretsUploadSchema.parse(secretsUploadPayload);
    console.log("Validated Payload:", validatedPayload);

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/step5-secretsUpload",
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
