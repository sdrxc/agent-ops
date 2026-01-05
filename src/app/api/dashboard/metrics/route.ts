import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import {
  DashboardMetricsSchema,
  type ApiResponse,
  type DashboardMetrics,
} from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // Authentication check disabled for demo mode
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Unauthorized",
    //       message: "Authentication required",
    //     } as ApiResponse<DashboardMetrics>,
    //     { status: 401 }
    //   );
    // }

    // Mock dashboard metrics - in a real app, this would come from database
    const metrics: DashboardMetrics = {
      totalAgents: 24,
      activeAgents: 18,
      averagePerformance: 91.2,
      totalTests: 15682,
      successRate: 94.7,
      averageResponseTime: 2.3,
    };

    // Validate response with Zod
    const validatedMetrics = DashboardMetricsSchema.parse(metrics);

    return NextResponse.json(
      {
        success: true,
        data: validatedMetrics,
      } as ApiResponse<DashboardMetrics>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in dashboard metrics route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch dashboard metrics",
      } as ApiResponse<DashboardMetrics>,
      { status: 500 },
    );
  }
}
