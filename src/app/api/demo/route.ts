import { NextRequest, NextResponse } from "next/server";
import {
  DemoResponseSchema,
  type ApiResponse,
  type DemoResponse,
} from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const response: DemoResponse = {
      message: "Hello from Next.js API route",
    };

    // Validate response with Zod
    const validatedResponse = DemoResponseSchema.parse(response);

    return NextResponse.json(
      {
        success: true,
        data: validatedResponse,
      } as ApiResponse<DemoResponse>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in demo route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to process demo request",
      } as ApiResponse<DemoResponse>,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response: DemoResponse = {
      message: `Echo: ${body.message || "No message provided"}`,
    };

    // Validate response with Zod
    const validatedResponse = DemoResponseSchema.parse(response);

    return NextResponse.json(
      {
        success: true,
        data: validatedResponse,
      } as ApiResponse<DemoResponse>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in demo POST route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to process demo POST request",
      } as ApiResponse<DemoResponse>,
      { status: 500 },
    );
  }
}
