import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json";
import axios from "axios";

// Define schema for each tool object
const toolSchema = z.object({
  toolID: z.string(),
  toolName: z.string(),
});

// Main payload schema
const step2ToolRegistrySchema = z.object({
  projectID: z.string(),
  sequenceID: z.string(),
  userID: z.string(),
  selectedToolData: z.array(toolSchema)
});

export async function POST(request: NextRequest) {
  try {
    const toolRegistryPayload = await request.json();

    // Validate payload
    const validated = step2ToolRegistrySchema.parse(toolRegistryPayload);
    console.log("Validated Payload:", validated);
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    console.log('ENV :', env);
    console.log('BACKEND_URL :', process.env.BACKEND_URL);

    // ✅ Use mock during local dev
    if (env === "local") {
      const data = response;
      return NextResponse.json(data);
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/step2-toolRegistry`,
      validated,
      { headers: { "Content-Type": "application/json" } }
    );
    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
