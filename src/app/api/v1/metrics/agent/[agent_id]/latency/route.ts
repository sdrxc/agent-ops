import { NextRequest, NextResponse } from "next/server";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> }
) {
  try {
    const resolvedParams = await params;
    const agentID = resolvedParams.agent_id;
    console.log("🌐 GET metrics for agent:", agentID);

    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: `/api/v1/metrics/agent/${agentID}/latency`,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Metric API GET Error:", error);
    return NextResponse.json(response);
  }
}
