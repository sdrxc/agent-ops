import { NextRequest, NextResponse } from "next/server";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectID = resolvedParams.project_id;
    console.log("🌐 GET metrics for project:", projectID);

    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: `/api/v1/metrics/project/${projectID}/model-distribution`,
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Metric API GET Error:", error);
    return NextResponse.json(response);
  }
}
