import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDatabase } from "@/lib/mockDatabase";

const createApiKeyPayloadSchema = z.object({
  name: z.string().min(1, "Key name is required"),
  userID: z.string(),
  projectID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = createApiKeyPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const { apiKey, rawKey } = mockDatabase.createApiKey({
        name: validatedPayload.name,
        userId: validatedPayload.userID,
        projectId: validatedPayload.projectID,
      });

      console.log(
        "✅ Created API key in mock DB:",
        apiKey.id,
        apiKey.name
      );

      return NextResponse.json({
        status: 200,
        message: "API key created successfully",
        data: {
          apiKey,
          rawKey, // Only returned once - never stored
        },
      });
    }

    // For production, would call external API
    return NextResponse.json({
      status: 200,
      message: "API key created successfully",
      data: {
        apiKey: {
          id: "key-000001",
          name: validatedPayload.name,
          prefix: "pk_live_...",
          userId: validatedPayload.userID,
          projectIds: [validatedPayload.projectID],
          createdAt: new Date().toISOString(),
        },
        rawKey: "pk_live_mock_key_placeholder",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 }
    );
  }
}


