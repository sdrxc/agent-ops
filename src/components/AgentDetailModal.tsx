import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Code,
  Shield,
  X,
  Activity,
  Clock,
  DollarSign,
  Zap,
} from "lucide-react";
import { Agent } from "@/types/api";
import { PromptPlaygroundTab } from "./tabs/PromptPlaygroundTab";
import { GuardrailsTab } from "./tabs/GuardrailsTab";

interface AgentDetailModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDetailModal({
  agent,
  isOpen,
  onClose,
}: AgentDetailModalProps) {
  const [activeTab, setActiveTab] = useState("playground");

  if (!agent) return null;

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "training":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "testing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        );
      case "inactive":
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case "error":
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        );
      case "training":
        return (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        );
      case "testing":
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        );
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  {agent.name}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(agent.status)}
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(agent.status)} text-sm font-medium`}
                    >
                      {agent.status.toUpperCase()}
                    </Badge>
                  </div>
                </DialogTitle>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span className="font-medium">Version:</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {agent.version}
                    </Badge>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{agent.lastActivity}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div className="font-bold text-gray-900">
                  {agent.performance?.successRate ?? 0}%
                </div>
                <div className="text-xs text-gray-500">Success</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="font-bold text-gray-900">
                  {agent.performance?.responseTime ?? 0}ms
                </div>
                <div className="text-xs text-gray-500">Response</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="font-bold text-gray-900">
                  ${agent.sessions?.costPerSession?.toFixed(3) ?? "0.000"}
                </div>
                <div className="text-xs text-gray-500">Cost/Session</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <div className="font-bold text-gray-900">
                  {((agent.tokens?.total ?? 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-500">Tokens</div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
              <TabsTrigger
                value="playground"
                className="flex items-center space-x-2"
              >
                <Code className="h-4 w-4" />
                <span>Prompt Playground & Version Control</span>
              </TabsTrigger>
              <TabsTrigger
                value="guardrails"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>AI Guardrails & Recommendations</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden p-6 pt-4">
              <TabsContent value="playground" className="h-full">
                <PromptPlaygroundTab agent={agent} />
              </TabsContent>

              <TabsContent value="guardrails" className="h-full">
                <GuardrailsTab agent={agent} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
