import { NextRequest, NextResponse } from "next/server";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

export async function GET(request: NextRequest) {
  try {
    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: "/api/v1/metrics/platform/latency",
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Metric API GET Error:", error);
    return NextResponse.json(response);
  }
}
