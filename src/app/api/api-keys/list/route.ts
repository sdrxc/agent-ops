import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDatabase } from "@/lib/mockDatabase";

const listApiKeysPayloadSchema = z.object({
  userID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = listApiKeysPayloadSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);

    // Use mock database in local mode
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    if (env === "local") {
      const apiKeys = mockDatabase.listApiKeys(validatedPayload.userID);
      console.log(
        "📋 Listing API keys from mock DB:",
        apiKeys.length,
        "keys"
      );

      return NextResponse.json({
        status: 200,
        message: "API keys fetched successfully",
        data: {
          apiKeys,
        },
      });
    }

    // For production, would call external API
    return NextResponse.json({
      status: 200,
      message: "API keys fetched successfully",
      data: {
        apiKeys: [],
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


