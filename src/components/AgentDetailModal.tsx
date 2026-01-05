/**
 * @deprecated This component is deprecated. Use the dedicated agent detail page at /agents/[id] instead.
 * The modal overlay approach has been replaced with a full page for better navigation, shareable URLs,
 * and improved accessibility.
 */

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
  Edit,
  Save,
  XCircle,
  Settings,
} from "lucide-react";
import { Agent, AgentConfigSnapshot } from "@/types/api";
import { EnhancedConfigTab } from "./tabs/EnhancedConfigTab";
import { AdvancedConfigTab } from "./tabs/AdvancedConfigTab";
import { GuardrailsTab } from "./tabs/GuardrailsTab";
import { agentsApi } from "@/domains/agents/api/agentsApi";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import toast from "react-hot-toast";

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
  const { user } = useGlobalContext();
  const { createVersion } = useVersionHistory(agent);

  // Tab and edit state
  const [activeTab, setActiveTab] = useState("playground");
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftConfig, setDraftConfig] = useState<AgentConfigSnapshot | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!agent) return null;

  // Helper: Create snapshot from agent
  const createSnapshotFromAgent = (agent: Agent): AgentConfigSnapshot => {
    return {
      name: agent.name,
      description: agent.description,
      tags: agent.tags,
      modelConfig: {
        model: agent.model || "gpt-4",
        temperature: 0.7,
        maxTokens: 2048,
      },
      systemPrompt: "",
      userPrompt: "",
      assistantPrompt: "",
      capabilities: {},
      skills: [],
      security: [],
    };
  };

  // Handle enter edit mode
  const handleEnterEditMode = () => {
    setDraftConfig(createSnapshotFromAgent(agent));
    setIsEditMode(true);
  };

  // Handle save changes
  const handleSave = async () => {
    if (!draftConfig) return;

    // Validation
    if (!draftConfig.name.trim()) {
      toast.error("Agent name is required", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
      return;
    }

    try {
      setIsSaving(true);

      // Create version
      const newVersion = createVersion(
        "Manual configuration edit",
        draftConfig,
        "dev"
      );

      // Update agent with new config and version
      await agentsApi.updateAgent(agent.id, {
        name: draftConfig.name,
        description: draftConfig.description,
        tags: draftConfig.tags,
        model: draftConfig.modelConfig?.model || agent.model,
        configVersions: [...(agent.configVersions || []), newVersion],
        currentVersionId: newVersion.id,
      });

      toast.success("Agent configuration updated!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      setIsEditMode(false);
      setDraftConfig(null);
    } catch (error: any) {
      console.error("Error saving agent:", error);
      toast.error(error?.message || "Failed to save agent configuration", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditMode(false);
    setDraftConfig(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "production":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
      case "development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "staging":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "production":
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        );
      case "inactive":
      case "development":
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case "staging":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
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
                    {getStatusIcon(
                      agent.status || agent.environment || "development"
                    )}
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(agent.status || agent.environment || "development")} text-sm font-medium`}
                    >
                      {(
                        agent.status ||
                        agent.environment ||
                        "development"
                      ).toUpperCase()}
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

            {/* Edit Mode Buttons or Quick Stats */}
            {isEditMode ? (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  size="sm"
                  variant="outline"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
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

                {/* Edit Button */}
                <Button
                  onClick={handleEnterEditMode}
                  size="sm"
                  variant="outline"
                  className="border-violet-200 hover:bg-violet-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Configuration
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList
              className={`grid w-full ${isEditMode ? "grid-cols-3" : "grid-cols-2"} mx-6 mt-4`}
            >
              <TabsTrigger
                value="playground"
                className="flex items-center space-x-2"
              >
                <Code className="h-4 w-4" />
                <span>Configuration & Playground</span>
              </TabsTrigger>
              {isEditMode && (
                <TabsTrigger
                  value="advanced"
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Advanced Configuration</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="guardrails"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Guardrails & Security</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden p-6 pt-4">
              <TabsContent value="playground" className="h-full">
                <EnhancedConfigTab
                  agent={agent}
                  isEditMode={isEditMode}
                  draftConfig={draftConfig}
                  onConfigChange={setDraftConfig}
                />
              </TabsContent>

              {isEditMode && (
                <TabsContent value="advanced" className="h-full">
                  <AdvancedConfigTab
                    config={draftConfig}
                    onConfigChange={setDraftConfig}
                  />
                </TabsContent>
              )}

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
