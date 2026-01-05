"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  Plus,
  Bot,
  Sparkles,
  Loader2,
  Trash2,
  X,
  MessageSquareText,
  Save,
  Paperclip,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChatInput } from "@/components/ChatInput";
import { InputGroupButton } from "@/components/ui/input-group";

// Types
interface PromptVersion {
  version: string;
  label: string;
  content: string;
  variables: string[];
  updatedAt: string;
  author: string;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  tags: string[];
  versions: PromptVersion[];
  latestVersion: string;
}

interface PromptEditorProps {
  prompt: Prompt | null;
  initialContent?: string;
  onNavigate?: (view: string, data?: any) => void;
  isPlayground?: boolean;
  onDeploy?: (name: string, version: string) => void;
  onSave?: (prompt: Prompt) => void;
  hideHeader?: boolean;
  onHandlersReady?: (handlers: { 
    save: () => void; 
    deploy: () => void; 
    isSaving: boolean;
    promptName: string;
    setPromptName: (name: string) => void;
  }) => void;
  controlledPromptName?: string;
  onPromptNameChange?: (name: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
}

interface ContextMessage {
  id: string;
  role: "user" | "model";
  content: string;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt: initialPrompt,
  initialContent,
  onNavigate,
  isPlayground = false,
  onDeploy,
  onSave,
  hideHeader = false,
  onHandlersReady,
  controlledPromptName,
  onPromptNameChange,
}) => {
  const router = useRouter();

  // State: Editor Content
  const [internalPromptName, setInternalPromptName] = useState(
    initialPrompt?.name || (isPlayground ? "New Playground Session" : "New Prompt")
  );

  // Use controlled promptName if provided, otherwise use internal state
  const promptName = controlledPromptName !== undefined ? controlledPromptName : internalPromptName;
  
  const setPromptName = (name: string) => {
    if (controlledPromptName !== undefined) {
      // Controlled mode - notify parent
      if (onPromptNameChange) {
        onPromptNameChange(name);
      }
    } else {
      // Uncontrolled mode - update internal state
      setInternalPromptName(name);
    }
  };

  // Sync internal state when initialPrompt changes
  // This is a legitimate prop-to-state sync pattern
  useEffect(() => {
    if (initialPrompt?.name && controlledPromptName === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInternalPromptName(initialPrompt.name);
    }
  }, [initialPrompt?.name, controlledPromptName]);

  // Versioning State
  const sortedVersions = initialPrompt?.versions
    ? [...initialPrompt.versions].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true })
      )
    : [];
  const latestVersionObj =
    sortedVersions.length > 0 ? sortedVersions[0] : null;

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    latestVersionObj?.version || null
  );

  // The content currently being edited (The Draft)
  const [draftContent, setDraftContent] = useState(
    latestVersionObj?.content || initialContent || "You are a helpful assistant."
  );
  const [draftVariables, setDraftVariables] = useState<string[]>(
    latestVersionObj?.variables || []
  );

  // Is the user viewing a historical version?
  const isViewingHistory =
    selectedVersionId &&
    latestVersionObj &&
    selectedVersionId !== latestVersionObj.version;
  const currentViewVersion = sortedVersions.find(
    (v) => v.version === selectedVersionId
  );

  // Derived state for the UI
  const displayContent =
    isViewingHistory && currentViewVersion
      ? currentViewVersion.content
      : draftContent;
  const isReadOnly = !!isViewingHistory;

  // State: Configuration
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState([0.7]);
  const [topP, setTopP] = useState([0.95]);
  const [maxOutputTokens, setMaxOutputTokens] = useState([2048]);
  const [enabledTools, setEnabledTools] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // State: Testing
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userTestInput, setUserTestInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Context Messages
  const [contextMessages, setContextMessages] = useState<ContextMessage[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Variable Detection Logic
  useEffect(() => {
    const textToScan = displayContent;
    const allText = [textToScan, ...contextMessages.map((m) => m.content)].join(
      "\n"
    );
    const matches = allText.match(/\{\{([^{}]+)\}\}/g);

    let vars: string[] = [];
    if (matches) {
      vars = Array.from(
        new Set(matches.map((m) => m.slice(2, -2).trim()))
      );
    }

    if (!isViewingHistory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftVariables(vars);
    }

    setVariableValues((prev) => {
      const next: Record<string, string> = {};
      vars.forEach((v) => {
        next[v] = prev[v] || "";
      });
      return next;
    });
  }, [displayContent, contextMessages, isViewingHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isRunning]);

  // Quick Save (Draft)
  const handleQuickSave = () => {
    setIsSaving(true);

    const currentVerString = latestVersionObj?.version || "v1.0";

    const updatedVersionObj: PromptVersion = {
      version: currentVerString,
      label: latestVersionObj?.label || "Draft",
      content: draftContent,
      variables: draftVariables,
      updatedAt: "Just now",
      author: "You",
    };

    if (initialPrompt) {
      const updatedVersions = initialPrompt.versions.map((v) =>
        v.version === currentVerString ? updatedVersionObj : v
      );

      const updatedPrompt: Prompt = {
        ...initialPrompt,
        name: promptName,
        versions: updatedVersions,
      };
      if (onSave) onSave(updatedPrompt);
    } else {
      // Create new
      const newPrompt: Prompt = {
        id: crypto.randomUUID(),
        name: promptName,
        description: isPlayground ? "Created via Playground" : "New Prompt",
        tags: [],
        latestVersion: "v1.0",
        versions: [updatedVersionObj],
      };
      if (onSave) onSave(newPrompt);
      setSelectedVersionId("v1.0");
    }

    setTimeout(() => setIsSaving(false), 500);
  };

  // Message Handling
  const addContextMessage = () => {
    if (isReadOnly) return;
    setContextMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role:
          prev.length > 0 && prev[prev.length - 1].role === "user"
            ? "model"
            : "user",
        content: "",
      },
    ]);
  };

  const removeContextMessage = (id: string) => {
    if (isReadOnly) return;
    setContextMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const updateContextMessage = (
    id: string,
    field: keyof ContextMessage,
    value: string
  ) => {
    if (isReadOnly) return;
    setContextMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Execution Logic (Mock for now - in production would call actual API)
  const handleRunTest = async () => {
    if (isRunning || (!userTestInput.trim() && contextMessages.length === 0))
      return;
    setIsRunning(true);

    let compiledSystemPrompt = displayContent;
    Object.entries(variableValues).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      compiledSystemPrompt = compiledSystemPrompt.replace(
        regex,
        val || `{{${key}}}`
      );
    });

    const currentInput = userTestInput;
    if (currentInput) {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: currentInput },
      ]);
      setUserTestInput("");
    }

    // Mock API call - in production, this would call the actual API
    setTimeout(() => {
      const mockResponse = `This is a mock response from ${model} for: "${currentInput}". In production, this would be a real API call with the system prompt: "${compiledSystemPrompt.substring(0, 50)}..."`;
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: mockResponse },
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const toggleTool = (tool: string) => {
    if (isReadOnly) return;
    setEnabledTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleBack = () => {
    if (isPlayground) {
      router.push("/assistant");
    } else if (onNavigate) {
      onNavigate("assistant");
    } else {
      router.push("/assistant");
    }
  };

  // Memoize deploy handler
  /* eslint-disable react-hooks/preserve-manual-memoization */
  const deployHandler = useCallback(() => {
    if (onDeploy) {
      onDeploy(promptName, latestVersionObj?.version || "v1.0");
    }
  }, [onDeploy, promptName, latestVersionObj]);

  // Memoize save handler for parent access
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveHandler = useCallback(() => {
    handleQuickSave();
  }, [draftContent, draftVariables, promptName, initialPrompt, latestVersionObj, onSave]);
  /* eslint-enable react-hooks/preserve-manual-memoization */

  // Expose handlers to parent when header is hidden
  useEffect(() => {
    if (hideHeader && onHandlersReady) {
      onHandlersReady({
        save: saveHandler,
        deploy: deployHandler,
        isSaving,
        promptName,
        setPromptName,
      });
    }
  }, [hideHeader, onHandlersReady, isSaving, saveHandler, deployHandler, promptName]);

  return (
    <div className={cn(
      "flex flex-col bg-background",
      hideHeader ? "h-full" : "h-[calc(100vh-4rem)]"
    )}>
      {/* Header */}
      {!hideHeader && (
        <div className="top-0 z-20 sticky flex flex-none justify-between items-center bg-background/80 backdrop-blur-sm px-8 py-5 border-b">
          <div className="flex items-center gap-4">
            {!isPlayground && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="w-8 h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            <div className="flex flex-col">
              <Input
                type="text"
                value={promptName}
                onChange={(e) => {
                  if (!isReadOnly) setPromptName(e.target.value);
                }}
                readOnly={isReadOnly}
                className={`text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 shadow-none ${
                  isReadOnly ? "cursor-default" : ""
                }`}
                placeholder={isPlayground ? "New Playground Session" : "New Prompt"}
              />
              {!isPlayground && latestVersionObj && (
                <Badge variant="outline" className="mt-1 w-fit text-xs">
                  {latestVersionObj.version} • {latestVersionObj.label}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleQuickSave}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <Save className="mr-2 w-4 h-4" />
              )}
              Save
            </Button>
            {onDeploy && (
              <Button size="sm" onClick={() => onDeploy(promptName, "v1.0")}>
                Deploy
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* LEFT COLUMN - Configuration & Editor */}
        <div className="flex flex-col bg-card shadow-sm border rounded-lg w-1/2 overflow-hidden">
          <div className="flex-1 space-y-6 p-6 overflow-y-auto">
            {/* Model Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Label className="font-semibold text-sm">Model</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <Select
                value={model}
                onValueChange={setModel}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>

              {showSettings && (
                <div className="space-y-4 bg-muted p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Temperature</Label>
                      <span className="text-muted-foreground text-xs">
                        {temperature[0]}
                      </span>
                    </div>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      min={0}
                      max={2}
                      step={0.1}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Top P</Label>
                      <span className="text-muted-foreground text-xs">
                        {topP[0]}
                      </span>
                    </div>
                    <Slider
                      value={topP}
                      onValueChange={setTopP}
                      min={0}
                      max={1}
                      step={0.05}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Max Tokens</Label>
                      <span className="text-muted-foreground text-xs">
                        {maxOutputTokens[0]}
                      </span>
                    </div>
                    <Slider
                      value={maxOutputTokens}
                      onValueChange={setMaxOutputTokens}
                      min={256}
                      max={4096}
                      step={256}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Variables */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="font-semibold text-sm">Variables</Label>
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      const newVar = `var${draftVariables.length + 1}`;
                      setDraftVariables([...draftVariables, newVar]);
                    }}
                  >
                    <Plus className="mr-1 w-3 h-3" /> Add
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {isViewingHistory
                  ? currentViewVersion?.variables?.map((v) => (
                      <Badge key={v} variant="outline" className="font-mono">
                        {`{{${v}}}`}
                      </Badge>
                    ))
                  : draftVariables.length > 0
                    ? draftVariables.map((v) => (
                        <Badge key={v} variant="secondary" className="font-mono">
                          {`{{${v}}}`}
                        </Badge>
                      ))
                    : (
                        <span className="text-muted-foreground text-xs italic">
                          No variables detected
                        </span>
                      )}

                {(draftVariables.length > 0 ||
                  (currentViewVersion?.variables?.length ?? 0) > 0) && (
                  <div className="gap-3 grid grid-cols-2 bg-muted mt-2 p-3 rounded-lg w-full">
                    {(isViewingHistory
                      ? currentViewVersion!.variables
                      : draftVariables
                    ).map((v) => (
                      <div key={`input-${v}`}>
                        <Label className="text-xs">{v}</Label>
                        <Input
                          type="text"
                          value={variableValues[v] || ""}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [v]: e.target.value,
                            }))
                          }
                          className="h-8 text-xs"
                          placeholder="Test value..."
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="font-semibold text-sm">Tools</Label>
                {!isReadOnly && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    <Plus className="mr-1 w-3 h-3" /> Add
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    enabledTools.includes("googleSearch") ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTool("googleSearch")}
                >
                  Google Search
                  {enabledTools.includes("googleSearch") && (
                    <X className="ml-1 w-3 h-3" />
                  )}
                </Badge>
              </div>
            </div>

            {/* System Instruction */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-semibold text-sm">
                  System Instruction
                </Label>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Sparkles className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Textarea
                value={
                  isViewingHistory
                    ? currentViewVersion?.content || ""
                    : draftContent
                }
                onChange={(e) => {
                  if (!isReadOnly) setDraftContent(e.target.value);
                }}
                readOnly={isReadOnly}
                className={`min-h-[200px] font-mono text-sm ${
                  isReadOnly ? "bg-muted cursor-not-allowed" : ""
                }`}
                placeholder="Describe desired model behavior (tone, tool usage, response style)"
              />
            </div>

            {/* Few-Shot Examples */}
            <div className="space-y-4">
              <Label className="font-semibold text-sm">Few-Shot Examples</Label>

              <div className="space-y-4">
                {contextMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="space-y-2 p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {msg.role.toUpperCase()}
                      </Badge>
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => removeContextMessage(msg.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={msg.content}
                      onChange={(e) =>
                        updateContextMessage(msg.id, "content", e.target.value)
                      }
                      readOnly={isReadOnly}
                      className={`font-mono text-sm ${
                        isReadOnly ? "bg-muted cursor-not-allowed" : ""
                      }`}
                      placeholder={`Enter ${msg.role} message...`}
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addContextMessage}
                >
                  <Plus className="mr-2 w-4 h-4" /> Add example
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Preview */}
        <div className="flex flex-col w-1/2">
          {chatHistory.length > 0 && (
            <div className="flex justify-end items-center px-6 py-3 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatHistory([])}
              >
                <Trash2 className="mr-2 w-4 h-4" /> Clear Chat
              </Button>
            </div>
          )}

          <div className="flex flex-col flex-1 p-6 overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col flex-1 justify-center items-center text-center">
                <p className="text-muted-foreground text-sm">
                  Test your prompt. Variables defined on the left will be injected into the conversation below.
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : msg.role === "error"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {msg.role === "user" ? (
                        "U"
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : msg.role === "error"
                            ? "bg-destructive/10 text-destructive rounded-tl-none"
                            : "bg-card border rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div>
            <ChatInput
              value={userTestInput}
              onChange={setUserTestInput}
              onSubmit={handleRunTest}
              variant="textarea"
              placeholder="Chat with your prompt..."
              isLoading={isRunning}
              startActions={
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </InputGroupButton>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};




