import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";
import { TraceDetailSchema } from "@/types/api";

const traceIdSchema = z.string().min(1);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate trace ID
    const validatedId = traceIdSchema.parse(id);
    console.log("Fetching trace:", validatedId);
    
    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: `/api/traces/${validatedId}`,
      },
      response
    );

    // Validate response with Zod
    const traceData = data.data || data;
    const validatedData = TraceDetailSchema.parse(traceData);
    
    return NextResponse.json({
      status: 200,
      message: "Trace fetched successfully",
      data: validatedData,
    });
  } catch (error: any) {
    console.error("❌ Trace API GET Error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid trace ID", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(response);
  }
}

