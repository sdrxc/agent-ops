"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  AlertCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { KPIGrid } from "@/components/KPIGrid";

interface CostData {
  id: string;
  agentName: string;
  totalCost: number;
  costPerSession: number;
  sessions: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
  costPerInputToken: number;
  costPerOutputToken: number;
  dailyCosts: number[];
  weeklyBudget: number;
  monthlyBudget: number;
}

interface UsageForecast {
  date: string;
  estimatedCost: number;
  estimatedSessions: number;
  confidence: number;
}

interface BudgetAlert {
  agentId: string;
  agentName: string;
  type: "warning" | "danger" | "info";
  message: string;
  threshold: number;
  current: number;
}

const mockCostData: CostData[] = [
  {
    id: "1",
    agentName: "Customer Support Bot",
    totalCost: 694.4,
    costPerSession: 0.045,
    sessions: 15420,
    trend: "stable",
    trendPercentage: 2.1,
    inputTokens: 1250000,
    outputTokens: 890000,
    model: "GPT-4",
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
    dailyCosts: [23.2, 25.1, 22.8, 24.5, 26.3, 21.9, 23.7],
    weeklyBudget: 200,
    monthlyBudget: 800,
  },
  {
    id: "2",
    agentName: "Content Generator",
    totalCost: 586.25,
    costPerSession: 0.067,
    sessions: 8750,
    trend: "up",
    trendPercentage: 15.3,
    inputTokens: 980000,
    outputTokens: 1340000,
    model: "GPT-4",
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
    dailyCosts: [18.5, 19.8, 21.2, 22.6, 24.1, 25.3, 26.8],
    weeklyBudget: 180,
    monthlyBudget: 720,
  },
  {
    id: "3",
    agentName: "Data Analyst",
    totalCost: 2029.2,
    costPerSession: 0.089,
    sessions: 22800,
    trend: "down",
    trendPercentage: -8.7,
    inputTokens: 3200000,
    outputTokens: 1800000,
    model: "GPT-4",
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
    dailyCosts: [75.2, 72.1, 68.9, 65.4, 62.8, 60.2, 58.7],
    weeklyBudget: 500,
    monthlyBudget: 2200,
  },
  {
    id: "4",
    agentName: "Code Review Assistant",
    totalCost: 109.44,
    costPerSession: 0.032,
    sessions: 3420,
    trend: "stable",
    trendPercentage: -1.2,
    inputTokens: 2100000,
    outputTokens: 780000,
    model: "CodeLlama",
    costPerInputToken: 0.000015,
    costPerOutputToken: 0.00002,
    dailyCosts: [3.8, 4.1, 3.9, 3.7, 4.2, 3.6, 4.0],
    weeklyBudget: 50,
    monthlyBudget: 200,
  },
  {
    id: "5",
    agentName: "Translation Service",
    totalCost: 639.6,
    costPerSession: 0.052,
    sessions: 12300,
    trend: "up",
    trendPercentage: 12.4,
    inputTokens: 1850000,
    outputTokens: 1650000,
    model: "mT5",
    costPerInputToken: 0.000025,
    costPerOutputToken: 0.000035,
    dailyCosts: [19.2, 20.8, 22.1, 23.5, 24.8, 26.2, 27.6],
    weeklyBudget: 220,
    monthlyBudget: 880,
  },
  {
    id: "6",
    agentName: "Sales Assistant",
    totalCost: 414.64,
    costPerSession: 0.073,
    sessions: 5680,
    trend: "down",
    trendPercentage: -5.9,
    inputTokens: 950000,
    outputTokens: 1150000,
    model: "GPT-4",
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
    dailyCosts: [15.8, 15.2, 14.6, 13.9, 13.1, 12.4, 11.8],
    weeklyBudget: 150,
    monthlyBudget: 600,
  },
];

const mockForecast: UsageForecast[] = [
  {
    date: "2024-01-16",
    estimatedCost: 165.2,
    estimatedSessions: 2840,
    confidence: 0.92,
  },
  {
    date: "2024-01-17",
    estimatedCost: 172.8,
    estimatedSessions: 2910,
    confidence: 0.89,
  },
  {
    date: "2024-01-18",
    estimatedCost: 168.5,
    estimatedSessions: 2875,
    confidence: 0.87,
  },
  {
    date: "2024-01-19",
    estimatedCost: 175.3,
    estimatedSessions: 2950,
    confidence: 0.85,
  },
  {
    date: "2024-01-20",
    estimatedCost: 180.1,
    estimatedSessions: 3020,
    confidence: 0.83,
  },
  {
    date: "2024-01-21",
    estimatedCost: 162.4,
    estimatedSessions: 2780,
    confidence: 0.81,
  },
  {
    date: "2024-01-22",
    estimatedCost: 159.8,
    estimatedSessions: 2740,
    confidence: 0.79,
  },
];

const mockBudgetAlerts: BudgetAlert[] = [
  {
    agentId: "2",
    agentName: "Content Generator",
    type: "warning",
    message:
      "Weekly budget usage at 89%. Consider optimizing prompt efficiency.",
    threshold: 180,
    current: 160.2,
  },
  {
    agentId: "5",
    agentName: "Translation Service",
    type: "danger",
    message: "Weekly budget exceeded by 12%. Immediate review recommended.",
    threshold: 220,
    current: 246.4,
  },
  {
    agentId: "3",
    agentName: "Data Analyst",
    type: "info",
    message: "Cost optimization successful. Running 15% under budget.",
    threshold: 500,
    current: 425.0,
  },
];

export const CostEstimation = () => {
  const [costData] = useState<CostData[]>(mockCostData);
  const [forecast] = useState<UsageForecast[]>(mockForecast);
  const [budgetAlerts] = useState<BudgetAlert[]>(mockBudgetAlerts);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const totalCost = costData.reduce((sum, item) => sum + item.totalCost, 0);
  const totalSessions = costData.reduce((sum, item) => sum + item.sessions, 0);
  const avgCostPerSession = totalCost / totalSessions;
  const totalBudget = costData.reduce(
    (sum, item) => sum + item.monthlyBudget,
    0
  );
  const budgetUtilization = (totalCost / totalBudget) * 100;

  const getTrendColor = (trend: CostData["trend"], percentage: number) => {
    if (trend === "up")
      return percentage > 10 ? "text-red-600" : "text-orange-600";
    if (trend === "down") return "text-green-600";
    return "text-gray-600";
  };

  const getTrendIcon = (trend: CostData["trend"]) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4" />;
      case "stable":
        return <Minus className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: BudgetAlert["type"]) => {
    switch (type) {
      case "danger":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  const getAlertIcon = (type: BudgetAlert["type"]) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const calculateTokenCost = (
    inputTokens: number,
    outputTokens: number,
    inputRate: number,
    outputRate: number
  ) => {
    return inputTokens * inputRate + outputTokens * outputRate;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Cost Estimation & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Monitor usage costs, optimize spending, and forecast future
              expenses
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="space-y-2">
            {budgetAlerts.map((alert, index) => (
              <Card
                key={index}
                className={`border ${getAlertColor(alert.type)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="font-medium">{alert.agentName}</p>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(alert.current)} /{" "}
                        {formatCurrency(alert.threshold)}
                      </p>
                      <Progress
                        value={(alert.current / alert.threshold) * 100}
                        className="w-24 h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="space-y-6 bg-gradient-to-r from-violet-100 dark:from-violet-900/50 to-violet-200 dark:to-violet-800/50 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 @container">
          <KPIGrid cards={[
            {
              title: "Total Cost",
              value: formatCurrency(totalCost),
              icon: DollarSign,
              description: "+5.2% vs last period",
            },
            {
              title: "Total Sessions",
              value: totalSessions.toLocaleString(),
              icon: BarChart3,
              description: "+12.8% vs last period",
            },
            {
              title: "Avg Cost/Session",
              value: formatCurrency(avgCostPerSession),
              icon: Calculator,
              description: "-3.1% vs last period",
            },
            {
              title: "Budget Usage",
              value: `${budgetUtilization.toFixed(1)}%`,
              icon: PieChart,
              description: `${formatCurrency(totalBudget)} monthly`,
            },
          ]} />
        </div>

        {/* Tabbed Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costData.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.agentName}
                          </h3>
                          <Badge variant="secondary">{item.model}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {item.sessions.toLocaleString()} sessions •{" "}
                          {formatCurrency(item.costPerSession)} per session
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(item.totalCost / totalCost) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-6">
                        <div
                          className={`flex items-center space-x-1 ${getTrendColor(item.trend, item.trendPercentage)}`}
                        >
                          {getTrendIcon(item.trend)}
                          <span className="text-sm font-medium">
                            {item.trendPercentage > 0 ? "+" : ""}
                            {item.trendPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(item.totalCost)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {((item.totalCost / totalCost) * 100).toFixed(1)}%
                            of total
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Input Tokens</TableHead>
                      <TableHead>Output Tokens</TableHead>
                      <TableHead>Token Cost</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Budget Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costData.map((item) => {
                      const tokenCost = calculateTokenCost(
                        item.inputTokens,
                        item.outputTokens,
                        item.costPerInputToken,
                        item.costPerOutputToken
                      );
                      const budgetUsage =
                        (item.totalCost / item.monthlyBudget) * 100;

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.agentName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.model}</Badge>
                          </TableCell>
                          <TableCell>
                            {item.inputTokens.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {item.outputTokens.toLocaleString()}
                          </TableCell>
                          <TableCell>{formatCurrency(tokenCost)}</TableCell>
                          <TableCell>
                            {item.sessions.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={budgetUsage}
                                className="w-16 h-2"
                              />
                              <span className="text-sm">
                                {budgetUsage.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Forecast (Next 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.estimatedSessions.toLocaleString()} estimated
                          sessions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(item.estimatedCost)}
                        </p>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">
                            {(item.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">
                    Weekly Forecast Summary
                  </p>
                  <p className="text-sm text-blue-700">
                    Estimated total:{" "}
                    {formatCurrency(
                      forecast.reduce(
                        (sum, item) => sum + item.estimatedCost,
                        0
                      )
                    )}
                    (
                    {forecast
                      .reduce((sum, item) => sum + item.estimatedSessions, 0)
                      .toLocaleString()}{" "}
                    sessions)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">
                          Model Optimization
                        </p>
                        <p className="text-sm text-green-700">
                          Consider using GPT-3.5-turbo for the Content Generator
                          to reduce costs by ~40% while maintaining quality for
                          most use cases.
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Potential savings: $234/month
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingDown className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Prompt Optimization
                        </p>
                        <p className="text-sm text-blue-700">
                          Data Analyst prompts are generating excessive output
                          tokens. Optimize prompts to be more concise while
                          maintaining functionality.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Potential savings: $156/month
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Calculator className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">
                          Usage Patterns
                        </p>
                        <p className="text-sm text-orange-700">
                          Translation Service has peak usage during business
                          hours. Consider implementing request batching to
                          reduce API calls.
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Potential savings: $89/month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
