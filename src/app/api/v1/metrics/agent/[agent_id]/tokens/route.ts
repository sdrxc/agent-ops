import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import response from "./response.json";

export async function GET(
  request: NextRequest,
  { params }: { params: { agent: string } }
) {
  try {
    const agentID = params.agent;
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    console.log("🌐 GET metrics for agent:", agentID);
    console.log("ENV:", env);
    console.log("BACKEND_URL:", process.env.BACKEND_URL);

    // ✅ Local mock response
    if (env === "local") {
      return NextResponse.json(response);
    }

    // ✅ Real backend call in non-local env
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/metrics/agent/${agentID}/tokens`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Metric API GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
