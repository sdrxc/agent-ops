"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChatInput } from "@/components/ChatInput";
import { InputGroupButton } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  Activity,
  Zap,
  Send,
  Bot,
  Share2,
  FileText,
  X,
  Globe,
  Paperclip,
  Search,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Agent, TraceExecutionContext } from "@/types/api";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import axios from "axios";
import {
  deserializeTraceContext,
  buildSimulatorState,
} from "@/lib/trace-context";
import { DebugModeIndicator } from "@/components/simulator/DebugModeIndicator";
import { cn } from "@/lib/utils";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

interface SimulatorEvent {
  id: string;
  type: "tool" | "retrieval" | "error" | "info";
  name: string;
  status: "success" | "error" | "loading";
  latency?: number;
  details?: string;
  timestamp: string;
}

export interface SimulatorCoreProps {
  // Agent Configuration
  agentId?: string; // Pre-populate specific agent
  showAgentSelector?: boolean; // Show/hide agent dropdown (default: true)

  // Layout Configuration
  embedded?: boolean; // Adjust layout for tab embedding (default: false)
  showPageHeader?: boolean; // Show/hide PageHeader (default: true)

  // Feature Configuration
  defaultMode?: "chat" | "api"; // Default interaction mode
  defaultEnvironment?: "Development" | "Staging" | "Production";

  // Callbacks
  onAgentChange?: (agentId: string) => void;
}

export function SimulatorCore({
  agentId,
  showAgentSelector = true,
  embedded = false,
  showPageHeader = true,
  defaultMode = "api",
  defaultEnvironment = "Development",
  onAgentChange,
}: SimulatorCoreProps) {
  const { user } = useGlobalContext();
  const searchParams = useSearchParams();
  const { simulatorChatEnabled } = useFeatureFlags();

  // Trace Context State (for debug mode)
  const [traceContext, setTraceContext] =
    useState<TraceExecutionContext | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Simulation Configuration
  // If chat is disabled and defaultMode is chat, use api instead
  const initialMode = !simulatorChatEnabled && defaultMode === "chat" ? "api" : defaultMode;
  const [mode, setMode] = useState<"chat" | "api">(initialMode);
  const [environment, setEnvironment] = useState<
    "Development" | "Staging" | "Production"
  >(defaultEnvironment);

  // Derive effective mode: if chat is disabled, use api mode
  const effectiveMode = !simulatorChatEnabled && mode === "chat" ? "api" : mode;

  // Agent Selection
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agentId || "");
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>("");
  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) || agents[0] || null;

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return agents;
    const query = agentSearchQuery.toLowerCase();
    return agents.filter((agent) =>
      agent.name.toLowerCase().includes(query) ||
      (agent.description?.toLowerCase().includes(query) ?? false)
    );
  }, [agents, agentSearchQuery]);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API/Payload State
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify({ key: "value" }, null, 2)
  );
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiMethod, setApiMethod] = useState("POST");
  const [apiUrl, setApiUrl] = useState("/api/v1/agents/process");

  // Debug State
  const [activeTab, setActiveTab] = useState<"events" | "state">("events");
  const [events, setEvents] = useState<SimulatorEvent[]>([]);
  const [agentState, setAgentState] = useState<Record<string, any>>({
    user_id: "usr_89230",
    subscription_tier: "free",
    session_duration: "0s",
    last_intent: "greeting",
    sentiment: "neutral",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const agentsLoadedRef = useRef<boolean>(false);

  // Reset session function - defined early so it can be used in handlers and useEffects
  const resetSession = useCallback((agent: Agent) => {
    const newMessage = {
      id: "1",
      role: "assistant" as const,
      content: `Hi there! I am ${agent.name}. How can I help you today?`,
      timestamp: "Now",
    };
    
    setMessages([newMessage]);
    setEvents([]);
    setJsonOutput(null);
    setApiStatus(null);
    setAgentState((prev) => ({
      ...prev,
      session_duration: "0s",
    }));
  }, []);

  // Fetch agents from API (only if agentId is not provided)
  const fetchAgents = useCallback(async () => {
    // If agentId is provided, skip fetching all agents
    if (agentId) {
      setLoadingAgents(false);
      return;
    }

    // Guard: Don't fetch if user data is not available yet
    if (!user?.userID) {
      setLoadingAgents(false);
      return;
    }

    // Guard: Don't refetch if we already have agents loaded
    // This prevents flickering when switching between agents
    if (agentsLoadedRef.current) {
      return;
    }

    try {
      setLoadingAgents(true);
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";

      const url = isLocalEnv
        ? `${baseURL}/api/listCatalogueAgents`
        : `/api/listCatalogueAgents`;

      const result = await axios.post(url, {
        userID: user.userID,
      });

      let returnedAgents: Agent[] = Array.isArray(result.data)
        ? result.data
        : result.data?.data?.agents || [];

      setAgents(returnedAgents || []);
      agentsLoadedRef.current = true; // Mark as loaded
      // Set initial agent if we don't have one selected and we have agents
      setSelectedAgentId((currentId) => {
        if (!currentId && returnedAgents.length > 0) {
          const initialAgent = returnedAgents[0];
          // Initialize messages for the first agent
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: `Hi there! I am ${initialAgent.name}. How can I help you today?`,
              timestamp: "Now",
            },
          ]);
          return initialAgent.id;
        }
        return currentId;
      });
    } catch (err) {
      console.error("Error loading agents:", err);
      setAgents([]);
      agentsLoadedRef.current = false; // Reset on error
    } finally {
      setLoadingAgents(false);
    }
  }, [user?.userID, agentId]);

  // Handle agentId prop changes - must use useEffect to respond to prop changes
  useEffect(() => {
    if (agentId) {
      const agent = agents.find((a) => a.id === agentId);
      if (agent) {
        setSelectedAgentId(agentId);
        resetSession(agent);
      } else {
        setSelectedAgentId(agentId);
      }
    } else {
      fetchAgents();
    }
  }, [agentId, fetchAgents, agents, resetSession]);

  // Hydrate from trace context (URL params) - must use useEffect to read searchParams
  useEffect(() => {
    const urlTraceId = searchParams.get("traceId");
    const urlMode = searchParams.get("mode");
    const urlContext = searchParams.get("context");

    if (urlTraceId && urlContext) {
      const context = deserializeTraceContext(urlContext);
      if (context) {
        setTraceId(urlTraceId);
        setTraceContext(context);
        setIsDebugMode(urlMode === "debug");

        // Build simulator state from context
        const simulatorState = buildSimulatorState(context);

        // Hydrate simulator state
        if (simulatorState.agentId && !agentId) {
          const agent = agents.find((a) => a.id === simulatorState.agentId);
          if (agent) {
            setSelectedAgentId(simulatorState.agentId);
            resetSession(agent);
          } else {
            setSelectedAgentId(simulatorState.agentId);
          }
        }
        if (simulatorState.jsonInput) {
          setJsonInput(simulatorState.jsonInput);
        }
      }
    }
  }, [searchParams, agentId, agents, resetSession]);

  // Scroll to bottom when messages change - DOM side effect requires useEffect
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Helper to handle agent selection with session reset
  const handleAgentSelect = useCallback((agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgentId(agentId);
      resetSession(agent);
      // Notify parent of agent change
      if (onAgentChange) {
        onAgentChange(agentId);
      }
    }
  }, [agents, resetSession, onAgentChange]);


  // --- Actions ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleChatSend = () => {
    if (!chatInput.trim() && !attachedFile) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachment: attachedFile
        ? {
            name: attachedFile.name,
            size: formatBytes(attachedFile.size),
            type: attachedFile.type,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setIsTyping(true);

    simulateAgentExecution(
      "chat",
      chatInput,
      attachedFile ? attachedFile.name : undefined
    );
  };

  const handleApiSend = () => {
    setJsonOutput(null);
    setApiStatus(null);
    setIsTyping(true);
    setActiveTab("events");
    simulateAgentExecution("api", jsonInput);
  };

  const simulateAgentExecution = (
    triggerType: "chat" | "api",
    payload: string,
    fileName?: string
  ) => {
    // 1. Initial Processing Event
    setTimeout(() => {
      addEvent({
        type: "info",
        name: triggerType === "api" ? "API Request" : "Ingestion",
        status: "success",
        latency: 45,
        details: fileName
          ? `Received message with attachment: ${fileName}`
          : `Received ${triggerType} trigger`,
      });
    }, 200);

    // 2. Logic / Tool Call
    setTimeout(() => {
      const toolName =
        triggerType === "chat"
          ? fileName
            ? "document_parser"
            : "intent_classifier"
          : "json_validator";

      addEvent({
        type: "tool",
        name: toolName,
        status: "success",
        latency: 120,
        details: "Processed input successfully",
      });
    }, 800);

    // 3. Final Response
    setTimeout(() => {
      setIsTyping(false);

      if (triggerType === "chat") {
        let replyContent =
          "I've processed that request. I found 2 records matching your criteria.";
        if (fileName) {
          replyContent = `I've successfully uploaded and analyzed **${fileName}**. It appears to be a financial document. Would you like me to summarize the key figures?`;
        }

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMsg]);

        addEvent({
          type: "info",
          name: "Completion",
          status: "success",
          latency: 850,
          details: "Response generated",
        });
      } else if (triggerType === "api") {
        setApiStatus(200);
        setJsonOutput(
          `{\n  "success": true,\n  "data": {\n    "id": "res_12345",\n    "processed": true\n  }\n}`
        );
        addEvent({
          type: "info",
          name: "API Response",
          status: "success",
          latency: 320,
          details: "200 OK",
        });
      }
    }, 1500);
  };

  const addEvent = (event: Omit<SimulatorEvent, "id" | "timestamp">) => {
    setEvents((prev) => [
      ...prev,
      {
        ...event,
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
    ]);
  };

  const containerClasses = cn(
    "flex flex-col min-h-0",
    embedded ? "h-full" : "h-full"
  );

  return (
    <div className={containerClasses}>
      {/* Debug Mode Indicator */}
      {isDebugMode && traceId && traceContext && (
        <DebugModeIndicator traceId={traceId} traceContext={traceContext} />
      )}

      {/* Header Controls */}
      <div className="mb-4 pb-4 border-b shrink-0">
        {showPageHeader && <PageHeader title="Agent Simulator" />}

        <div className="flex items-center justify-between gap-4">
          {/* Mode Switcher - Only show when there are multiple options */}
          {simulatorChatEnabled && (
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={effectiveMode === "chat" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("chat")}
                className="h-8"
                disabled={!simulatorChatEnabled}
              >
                Chat
              </Button>
              <Button
                variant={effectiveMode === "api" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("api")}
                className="h-8"
              >
                API
              </Button>
            </div>
          )}

          {/* Environment Selector and Action Buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <Select
              value={environment}
              onValueChange={(value) =>
                setEnvironment(value as typeof environment)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Development">Dev Environment</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => selectedAgent && resetSession(selectedAgent)}
              size="sm"
            >
              <RotateCcw className="mr-2 size-4" />
              Reset
            </Button>
            <Button variant="default" size="sm">
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Left: Main Canvas */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* MODE: CHAT */}
          {effectiveMode === "chat" && (
            <div className="flex flex-col w-full h-full max-w-4xl mx-auto">
              {/* Chat Messages */}
              <div className="flex-1 space-y-6 p-6 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "user" ? "U" : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`p-4 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      }`}
                    >
                      {msg.attachment && (
                        <div className="flex items-center gap-3 bg-background/10 mb-3 p-2.5 border rounded-lg">
                          <div className="bg-background/20 p-2 rounded-md">
                            <FileText className="size-4 text-foreground" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-medium text-xs truncate">
                              {msg.attachment.name}
                            </div>
                            <div className="opacity-70 text-[10px]">
                              {msg.attachment.size}
                            </div>
                          </div>
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted p-4 rounded-2xl rounded-tl-none">
                      <div className="bg-muted-foreground rounded-full w-1.5 h-1.5 animate-bounce [animation-delay:0ms]"></div>
                      <div className="bg-muted-foreground rounded-full w-1.5 h-1.5 animate-bounce [animation-delay:150ms]"></div>
                      <div className="bg-muted-foreground rounded-full w-1.5 h-1.5 animate-bounce [animation-delay:300ms]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 shrink-0">
                {attachedFile && (
                  <div className="flex items-center gap-2 bg-muted mb-3 p-2 border rounded-lg w-fit">
                    <div className="bg-primary/10 p-1.5 rounded text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="text-xs">
                      <div className="max-w-[200px] font-medium truncate">
                        {attachedFile.name}
                      </div>
                      <div className="text-muted-foreground">
                        {formatBytes(attachedFile.size)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="ml-2 size-6"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <ChatInput
                  value={chatInput}
                  onChange={setChatInput}
                  onSubmit={handleChatSend}
                  variant="textarea"
                  placeholder="Chat with your agent..."
                  isLoading={isTyping}
                  startActions={
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full"
                      aria-label="Attach file"
                    >
                      <Paperclip className="size-4" />
                    </InputGroupButton>
                  }
                />
              </div>
            </div>
          )}

          {/* MODE: API */}
          {effectiveMode === "api" && (
            <div className="flex gap-6 w-full h-full">
              <Card className="flex flex-col flex-1 overflow-hidden">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 rounded-full w-1 h-8"></div>
                    <CardTitle>API Request</CardTitle>
                  </div>
                </CardHeader>

                <div className="flex gap-3 bg-muted/50 p-5 border-b">
                  <Select value={apiMethod} onValueChange={setApiMethod}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.acme.com/v1/..."
                    className="flex-1 font-mono"
                  />
                  <Button onClick={handleApiSend} disabled={isTyping}>
                    {isTyping ? (
                      <Activity className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 size-4" />
                    )}
                    Send
                  </Button>
                </div>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="flex-1 border-0 rounded-none h-full font-mono text-sm resize-none"
                    spellCheck={false}
                    placeholder="{ ... }"
                  />
                </CardContent>
              </Card>

              {/* Response Panel */}
              <Card className="flex flex-col bg-slate-950 border-slate-800 w-[45%] overflow-hidden">
                <CardHeader className="bg-slate-900/50 border-slate-800 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-slate-100">
                      <Globe className="size-4 text-slate-400" />
                      Response
                    </div>
                    {apiStatus && (
                      <Badge
                        variant={
                          apiStatus >= 200 && apiStatus < 300
                            ? "default"
                            : "destructive"
                        }
                        className="font-mono text-[10px]"
                      >
                        {apiStatus} OK
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 bg-slate-950 p-5 overflow-auto">
                  {jsonOutput ? (
                    <pre className="font-mono text-emerald-400 text-sm leading-relaxed">
                      {jsonOutput}
                    </pre>
                  ) : isTyping ? (
                    <div className="flex flex-col justify-center items-center gap-2 h-full">
                      <Activity className="size-8 text-slate-800 animate-spin" />
                      <p className="text-slate-700 text-xs">
                        Sending Request...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center opacity-50 h-full text-slate-800 select-none">
                      <Globe className="stroke-[1] size-12" />
                      <p className="mt-2 font-medium text-sm">
                        Send request to see response
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar - Agents List - Only show in standalone mode */}
        {!embedded && showAgentSelector && !agentId && (
          <Card className="flex flex-col border-l w-80 overflow-hidden shrink-0">
            {/* Search Input */}
            <div className="p-4 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search agents..."
                  value={agentSearchQuery}
                  onChange={(e) => setAgentSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Agents List */}
            <div className="flex-1 overflow-y-auto">
              {loadingAgents ? (
                <div className="flex flex-col justify-center items-center gap-3 h-full text-muted-foreground select-none p-8">
                  <Activity className="stroke-[1.5] size-8 animate-spin" />
                  <p className="font-medium text-xs">Loading agents...</p>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="flex flex-col justify-center items-center gap-3 h-full text-muted-foreground select-none p-8">
                  <Bot className="stroke-[1.5] size-8" />
                  <p className="font-medium text-xs">
                    {agentSearchQuery ? "No agents found" : "No agents available"}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-colors",
                        "hover:bg-muted/50 hover:border-border",
                        selectedAgentId === agent.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border"
                      )}
                    >
                      <div className="font-semibold text-sm mb-1 truncate">
                        {agent.name}
                      </div>
                      {agent.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {agent.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
