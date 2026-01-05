"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bot,
  Activity,
  Clock,
  DollarSign,
  Zap,
  Edit,
  Save,
  XCircle,
  Code,
  Settings,
  Shield,
  Loader2,
  PlayCircle,
  ChevronDown,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Agent, AgentConfigSnapshot } from "@/types/api";
import { EnhancedConfigTab } from "@/components/tabs/EnhancedConfigTab";
import { AdvancedConfigTab } from "@/components/tabs/AdvancedConfigTab";
import { GuardrailsTab } from "@/components/tabs/GuardrailsTab";
import { SimulatorTab } from "@/components/tabs/SimulatorTab";
import { ExamplesTab } from "@/components/tabs/ExamplesTab";
import { agentsApi } from "@/domains/agents/api/agentsApi";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AgentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useGlobalContext();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftConfig, setDraftConfig] = useState<AgentConfigSnapshot | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const { createVersion } = useVersionHistory(agent);

  // Tab state for controlled navigation
  const [activeTab, setActiveTab] = useState("playground");

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";
        const url = isLocalEnv
          ? `${baseURL}/api/agentDetails`
          : `/api/agentDetails`;

        const response = await axios.post(url, { agentID: id });
        const agentData = response?.data?.data || null;
        setAgent(agentData);
      } catch (error: any) {
        console.error("Error fetching agent details:", error);
        setError("Failed to load agent details.");
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  // Helper: Create snapshot from agent
  const createSnapshotFromAgent = (agent: Agent): AgentConfigSnapshot => {
    return {
      name: agent.name,
      description: agent.description || "",
      tags: agent.tags || [],
      modelConfig: {
        model: agent.model || "gpt-4",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0,
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
    if (!agent) return;
    setDraftConfig(createSnapshotFromAgent(agent));
    setIsEditMode(true);
    setActiveTab("playground"); // Auto-navigate to Configuration tab
  };

  // Handle save version (update current agent)
  const handleSaveVersion = async () => {
    if (!draftConfig || !agent) return;

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
      const updatedAgent = await agentsApi.updateAgent(agent.id, {
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

      // Update local agent state
      setAgent(updatedAgent);
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

  // Handle save copy (create new agent)
  const handleSaveCopy = async () => {
    if (!draftConfig || !agent) return;

    // Validation
    if (!draftConfig.name.trim()) {
      toast.error("Agent name is required", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
      return;
    }

    if (!agent.projectID) {
      toast.error("Cannot copy agent: project information missing");
      return;
    }

    try {
      setIsSaving(true);

      // Generate copy name with smart suffix
      const generateCopyName = (originalName: string): string => {
        const copyRegex = /\(Copy\s*(\d*)\)$/;
        const match = originalName.match(copyRegex);

        if (match) {
          const num = match[1] ? parseInt(match[1]) : 1;
          return originalName.replace(copyRegex, `(Copy ${num + 1})`);
        } else {
          return `${originalName} (Copy)`;
        }
      };

      const copyName = generateCopyName(draftConfig.name);

      // Create initial version
      const initialVersion = createVersion(
        "Initial configuration from copy",
        { ...draftConfig, name: copyName },
        "dev"
      );

      // Create new agent
      const newAgent = await agentsApi.registerAgent({
        userID: user?.userID || "unknown",
        projectID: agent.projectID,
        name: copyName,
        description: draftConfig.description,
        tags: draftConfig.tags,
      });

      // Update with full config
      await agentsApi.updateAgent(newAgent.id, {
        model: draftConfig.modelConfig?.model || "gpt-4",
        configVersions: [initialVersion],
        currentVersionId: initialVersion.id,
      });

      toast.success(`Agent copied as "${copyName}"!`, {
        style: { background: "#dcfce7", color: "#166534" },
      });

      // Navigate to new agent
      router.push(`/agents/${newAgent.id}`);
    } catch (error: any) {
      console.error("Error copying agent:", error);
      toast.error(error?.message || "Failed to copy agent", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditMode(false);
    setDraftConfig(null);
  };

  const getEnvironmentColor = (environment?: Agent["environment"]) => {
    switch (environment) {
      case "production":
        return "bg-green-100 text-green-800 border-green-200";
      case "staging":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEnvironmentIcon = (environment?: Agent["environment"]) => {
    switch (environment) {
      case "production":
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        );
      case "staging":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case "development":
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6 px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading agent details...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <>
            <PageHeader
              backButton={{ href: "/agents", label: "Back to Agents" }}
              title="Agent Not Found"
            />
            <p className="text-center text-red-500 dark:text-red-400">
              {error}
            </p>
          </>
        )}

        {/* Main Content */}
        {!loading && !error && agent && (
          <>
            {/* Page Header with Back Arrow */}
            <PageHeader
              backButton={{ href: "/agents", label: "Back to Agents" }}
              title={agent.name}
              description={agent.description || undefined}
              actions={
                isEditMode ? (
                  <div className="flex items-center space-x-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          disabled={isSaving}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem
                          onClick={handleSaveVersion}
                          disabled={isSaving}
                          className="cursor-pointer"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          <div className="flex flex-col">
                            <span className="font-medium">Save Version</span>
                            <span className="text-xs text-muted-foreground">
                              Update current agent
                            </span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleSaveCopy}
                          disabled={isSaving}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          <div className="flex flex-col">
                            <span className="font-medium">Save Copy</span>
                            <span className="text-xs text-muted-foreground">
                              Create new agent
                            </span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  <Button
                    onClick={handleEnterEditMode}
                    size="sm"
                    variant="outline"
                    className="border-violet-200 hover:bg-violet-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Configuration
                  </Button>
                )
              }
            />

            {/* Agent Metadata Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar
                      className={cn(
                        "bg-gradient-to-br from-[#10384F] to-[#89D329] w-16 h-16",
                        agent.status === "inactive" && "grayscale"
                      )}
                    >
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/shapes/svg?seed=${agent.id}&backgroundColor=transparent`}
                        alt={agent.name}
                        className="p-2"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        <Bot className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Metadata */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {getEnvironmentIcon(agent.environment)}
                        <Badge
                          variant="outline"
                          className={`${getEnvironmentColor(agent.environment)} text-sm font-medium capitalize`}
                        >
                          {agent.environment || "development"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono"
                        >
                          {agent.version}
                        </Badge>
                        <span className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {agent.lastActivity}
                        </span>
                        {agent.beatID && (
                          <Badge variant="outline" className="text-xs">
                            BeatID: {agent.beatID}
                          </Badge>
                        )}
                        {agent.visibility && (
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {agent.visibility}
                          </Badge>
                        )}
                      </div>

                      {agent.provider && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium">
                            {agent.provider.name}
                          </span>
                          {agent.provider.githubURL && (
                            <a
                              href={agent.provider.githubURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              (GitHub)
                            </a>
                          )}
                        </div>
                      )}

                      {agent.agentURL?.apiEndpoint && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">API Endpoint:</span>
                            <a
                              href={agent.agentURL.apiEndpoint}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-mono text-xs"
                            >
                              {agent.agentURL.apiEndpoint}
                            </a>
                          </div>
                          {agent.agentURL.swaggerDocs && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Swagger:</span>
                              <a
                                href={agent.agentURL.swaggerDocs}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-mono text-xs"
                              >
                                {agent.agentURL.swaggerDocs}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {agent.tags && agent.tags.length > 0 ? (
                          agent.tags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-secondary/50 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            No tags
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Quick Stats (if not in edit mode) */}
                  {!isEditMode && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="font-bold text-gray-900">
                          {agent.performance?.successRate ?? 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Success Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="font-bold text-gray-900">
                          {agent.performance?.responseTime ?? 0}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          Response Time
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="font-bold text-gray-900">
                          $
                          {agent.sessions?.costPerSession?.toFixed(3) ??
                            "0.000"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cost/Session
                        </div>
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
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1 flex flex-col"
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col"
              >
                <TabsList
                  className={`grid w-full ${isEditMode ? "grid-cols-4" : "grid-cols-3"}`}
                >
                  <TabsTrigger
                    value="playground"
                    className="flex items-center space-x-2"
                  >
                    <Code className="h-4 w-4" />
                    <span>Configuration</span>
                  </TabsTrigger>
                  {isEditMode && (
                    <TabsTrigger
                      value="advanced"
                      className="flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Advanced</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="simulator"
                    className="flex items-center space-x-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Simulator</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="guardrails"
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Guardrails</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="examples"
                    className="flex items-center space-x-2"
                  >
                    <Code className="h-4 w-4" />
                    <span>Examples</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 mt-4">
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

                  <TabsContent value="simulator" className="h-full">
                    <SimulatorTab agent={agent} />
                  </TabsContent>

                  <TabsContent value="guardrails" className="h-full">
                    <GuardrailsTab agent={agent} />
                  </TabsContent>

                  <TabsContent value="examples" className="h-full">
                    <ExamplesTab agent={agent} />
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </>
        )}

        {/* No Agent Details */}
        {!loading && !error && !agent && (
          <>
            <PageHeader
              backButton={{ href: "/agents", label: "Back to Agents" }}
              title="Agent Not Found"
            />
            <p className="text-center text-gray-500 dark:text-gray-400">
              No details found for this agent.
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
