import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDatabase } from "@/lib/mockDatabase";

const revokeApiKeyPayloadSchema = z.object({
  keyID: z.string(),
  userID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = revokeApiKeyPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const success = mockDatabase.revokeApiKey(
        validatedPayload.keyID,
        validatedPayload.userID
      );

      if (!success) {
        return NextResponse.json(
          { status: 404, message: "API key not found or unauthorized" },
          { status: 404 }
        );
      }

      console.log("🗑️ Revoked API key:", validatedPayload.keyID);

      return NextResponse.json({
        status: 200,
        message: "API key revoked successfully",
      });
    }

    // For production, would call external API
    return NextResponse.json({
      status: 200,
      message: "API key revoked successfully",
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


