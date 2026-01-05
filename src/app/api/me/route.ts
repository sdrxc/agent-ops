import { NextRequest, NextResponse } from "next/server";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

export async function GET(request: NextRequest) {
  try {
    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: "/api/me",
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/me Error:", error);
    // Return mock data as fallback
    return NextResponse.json(response);
  }
}

