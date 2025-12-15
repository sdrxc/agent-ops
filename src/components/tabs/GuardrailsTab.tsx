import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Settings,
  Lightbulb,
  Target,
  BarChart3,
  FileText,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Agent } from "@/types/api";

interface GuardrailsTabProps {
  agent: Agent;
}

interface GuardrailRule {
  id: string;
  name: string;
  category: "content" | "privacy" | "security" | "compliance";
  enabled: boolean;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detections: number;
  falsePositives: number;
  accuracy: number;
}

interface Recommendation {
  id: string;
  type: "security" | "performance" | "compliance" | "cost";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  status: "new" | "accepted" | "dismissed" | "implemented";
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  coverage: number;
  requirements: number;
  implemented: number;
}

const mockGuardrails: GuardrailRule[] = [
  {
    id: "1",
    name: "Toxicity Detection",
    category: "content",
    enabled: true,
    severity: "high",
    description: "Detects and blocks toxic, hateful, or offensive content",
    detections: 23,
    falsePositives: 2,
    accuracy: 91.3,
  },
  {
    id: "2",
    name: "PII Protection",
    category: "privacy",
    enabled: true,
    severity: "critical",
    description: "Identifies and masks personally identifiable information",
    detections: 156,
    falsePositives: 8,
    accuracy: 94.9,
  },
  {
    id: "3",
    name: "Prompt Injection Guard",
    category: "security",
    enabled: true,
    severity: "critical",
    description: "Prevents prompt injection and jailbreak attempts",
    detections: 45,
    falsePositives: 3,
    accuracy: 93.3,
  },
  {
    id: "4",
    name: "Violence Detection",
    category: "content",
    enabled: false,
    severity: "medium",
    description: "Detects content related to violence or harm",
    detections: 8,
    falsePositives: 1,
    accuracy: 87.5,
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    type: "security",
    priority: "high",
    title: "Enable Additional Content Filters",
    description:
      "Based on your agent's interaction patterns, we recommend enabling violence detection filters to improve safety.",
    impact: "Reduces potential harmful content by 85%",
    effort: "low",
    status: "new",
  },
  {
    id: "2",
    type: "compliance",
    priority: "medium",
    title: "GDPR Compliance Enhancement",
    description:
      "Your agent handles user data. Implementing additional GDPR controls would improve compliance.",
    impact: "Ensures full GDPR compliance",
    effort: "medium",
    status: "new",
  },
  {
    id: "3",
    type: "performance",
    priority: "low",
    title: "Optimize Filter Performance",
    description:
      "Current content filters add 45ms latency. Consider optimizing filter order for better performance.",
    impact: "Reduces response time by 12%",
    effort: "low",
    status: "accepted",
  },
];

const complianceFrameworks: ComplianceFramework[] = [
  {
    id: "gdpr",
    name: "GDPR",
    description: "General Data Protection Regulation",
    coverage: 78,
    requirements: 23,
    implemented: 18,
  },
  {
    id: "hipaa",
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act",
    coverage: 45,
    requirements: 18,
    implemented: 8,
  },
  {
    id: "sox",
    name: "SOC",
    description: "System and Organization Controls",
    coverage: 92,
    requirements: 12,
    implemented: 11,
  },
];

export function GuardrailsTab({ agent }: GuardrailsTabProps) {
  const [activeTab, setActiveTab] = useState("guardrails");
  const [guardrails, setGuardrails] = useState(mockGuardrails);
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const toggleGuardrail = (id: string) => {
    setGuardrails(
      guardrails.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    );
  };

  const updateRecommendationStatus = (
    id: string,
    status: Recommendation["status"],
  ) => {
    setRecommendations(
      recommendations.map((rec) => (rec.id === id ? { ...rec, status } : rec)),
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="h-4 w-4" />;
      case "performance":
        return <TrendingUp className="h-4 w-4" />;
      case "compliance":
        return <FileText className="h-4 w-4" />;
      case "cost":
        return <Target className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="guardrails" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {guardrails.filter((g) => g.enabled).length}
                      </div>
                      <div className="text-sm text-gray-600">Active Rules</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {guardrails.reduce((sum, g) => sum + g.detections, 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Detections
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {(
                          guardrails.reduce((sum, g) => sum + g.accuracy, 0) /
                          guardrails.length
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-sm text-gray-600">Avg Accuracy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {guardrails.reduce(
                          (sum, g) => sum + g.falsePositives,
                          0,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        False Positives
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Guardrail Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Guardrails</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guardrails.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => toggleGuardrail(rule.id)}
                          />
                          <span className="font-semibold">{rule.name}</span>
                          <Badge
                            variant="outline"
                            className={getSeverityColor(rule.severity)}
                          >
                            {rule.severity}
                          </Badge>
                          <Badge variant="secondary">{rule.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {rule.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">
                            Detections:{" "}
                            <span className="font-medium">
                              {rule.detections}
                            </span>
                          </span>
                          <span className="text-gray-500">
                            Accuracy:{" "}
                            <span className="font-medium">
                              {rule.accuracy}%
                            </span>
                          </span>
                          <span className="text-gray-500">
                            False Positives:{" "}
                            <span className="font-medium">
                              {rule.falsePositives}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Intelligent Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(rec.type)}
                          <div>
                            <h4 className="font-semibold">{rec.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant="outline"
                                className={getPriorityColor(rec.priority)}
                              >
                                {rec.priority} priority
                              </Badge>
                              <Badge variant="secondary">{rec.type}</Badge>
                              <Badge variant="outline">
                                {rec.effort} effort
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            rec.status === "new" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {rec.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {rec.description}
                      </p>
                      <p className="text-sm text-green-600 font-medium mb-3">
                        Impact: {rec.impact}
                      </p>

                      {rec.status === "new" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateRecommendationStatus(rec.id, "accepted")
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateRecommendationStatus(rec.id, "dismissed")
                            }
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Real-time Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">System Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        Operational
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Threat Detection Rate</span>
                        <span className="text-sm font-medium">99.2%</span>
                      </div>
                      <Progress value={99.2} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Filter Performance</span>
                        <span className="text-sm font-medium">45ms avg</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        Low Risk
                      </div>
                      <div className="text-sm text-gray-600">
                        Overall Security Score
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Content Safety</span>
                        <span className="text-sm font-medium text-green-600">
                          95%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Privacy Protection</span>
                        <span className="text-sm font-medium text-green-600">
                          98%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Security Controls</span>
                        <span className="text-sm font-medium text-yellow-600">
                          87%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      time: "2 minutes ago",
                      event: "PII detection blocked sensitive data exposure",
                      severity: "high",
                    },
                    {
                      time: "15 minutes ago",
                      event:
                        "Content filter flagged potentially toxic response",
                      severity: "medium",
                    },
                    {
                      time: "1 hour ago",
                      event: "Prompt injection attempt detected and blocked",
                      severity: "critical",
                    },
                    {
                      time: "3 hours ago",
                      event: "Routine security scan completed successfully",
                      severity: "low",
                    },
                  ].map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="text-sm">{event.event}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getSeverityColor(event.severity)}
                      >
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Compliance Frameworks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {complianceFrameworks.map((framework) => (
                    <div key={framework.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{framework.name}</h4>
                          <p className="text-sm text-gray-600">
                            {framework.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {framework.coverage}%
                          </div>
                          <div className="text-sm text-gray-600">Coverage</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            Implementation Progress
                          </span>
                          <span className="text-sm font-medium">
                            {framework.implemented} / {framework.requirements}{" "}
                            requirements
                          </span>
                        </div>
                        <Progress value={framework.coverage} className="h-2" />
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
