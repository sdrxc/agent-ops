import { Bot, Clock, Target, TrendingUp, Zap, Activity } from "lucide-react";
import { DashboardMetrics } from "@/types/api";
import { KPIGrid } from "./KPIGrid";

interface KPIDashboardProps {
  metrics: DashboardMetrics;
}

export function KPIDashboard({ metrics }: KPIDashboardProps) {
  const kpiCards = [
    {
      title: "Total Agents",
      value: metrics.totalAgents,
      icon: Bot,
      description: `${metrics.activeAgents} active`,
    },
    {
      title: "Success Rate",
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: Target,
      description: "Test success rate",
    },
    {
      title: "Avg Performance",
      value: `${metrics.averagePerformance.toFixed(1)}%`,
      icon: Activity,
      description: "Overall performance",
    },
    {
      title: "Total Tests",
      value: metrics.totalTests.toLocaleString(),
      icon: Zap,
      description: "Tests completed",
    },
    {
      title: "Response Time",
      value: `${metrics.averageResponseTime}ms`,
      icon: Clock,
      description: "Average response",
    },
    {
      title: "Uptime",
      value: "99.9%",
      icon: TrendingUp,
      description: "System availability",
    },
  ];

  return <KPIGrid cards={kpiCards} />;
}
