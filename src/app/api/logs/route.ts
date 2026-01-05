import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json";
import axios from "axios";

const listLogsPayloadSchema = z.object({
  userID: z.string().optional(),
  projectID: z.string().optional(),
  environment: z.enum(["dev", "qa", "prod"]).optional(),
  timeRange: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = listLogsPayloadSchema.parse(body);
    
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    // Use mock during local dev
    if (env === "local") {
      return NextResponse.json(response);
    }

    // Real backend call in production
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/logs`,
      validatedPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    // Use mock during local dev
    if (env === "local") {
      return NextResponse.json(response);
    }

    // Real backend call in production
    const { data } = await axios.get(`${process.env.BACKEND_URL}/api/logs`, {
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

