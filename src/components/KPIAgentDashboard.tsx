import {
  Activity,
  BarChart3,
  DollarSign,
  ShieldAlert,
  Target,
  Zap,
} from "lucide-react";
import { AgentDashboardMetrics } from "@/types/api";
import { KPIGrid } from "./KPIGrid";

interface KPIAgentProps {
  metrics: AgentDashboardMetrics;
}

export function KPIAgentDashboard({ metrics }: KPIAgentProps) {
  const kpiCards = [
    {
      title: "Accuracy",
      value: metrics.accuracy,
      icon: Target,
      description: "LLM evaluated accuracy",
    },
    {
      title: "Success Rate",
      value: `${metrics.success_rate.toFixed(1)}%`,
      icon: Target,
      description: "Overall request success rate",
    },
    {
      title: "Error Rate",
      value: `${metrics.error_rate.toFixed(2)}%`,
      icon: ShieldAlert,
      description: "Failed or timed-out requests",
    },
    {
      title: "Avg Tokens / Request",
      value: metrics.avg_tokens_per_request.toFixed(2),
      icon: Activity,
      description: "Average token usage per call",
    },
    {
      title: "Avg Cost / Request",
      value: `$${metrics.avg_cost_per_request.toFixed(6)}`,
      icon: BarChart3,
      description: "Mean cost per API request",
    },
    {
      title: "Total Cost",
      value: `$${metrics.total_cost.toFixed(4)}`,
      icon: DollarSign,
      description: "Cumulative cost of all requests",
    },
    {
      title: "Total Tokens",
      value: metrics.total_tokens.toLocaleString(),
      icon: Zap,
      description: "Overall tokens processed",
    },
    {
      title: "Total Requests",
      value: metrics.total_requests.toLocaleString(),
      icon: BarChart3,
      description: "API requests processed",
    },
  ];

  return <KPIGrid cards={kpiCards} />;
}
