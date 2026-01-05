/**
 * Enhanced Configuration Tab
 * Main configuration editor for agents with version history and templates
 * Supports both view and edit modes
 */

import { useState } from "react";
import { Agent, AgentConfigSnapshot } from "@/types/api";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Play } from "lucide-react";
import { VersionHistoryCard } from "@/components/cards/VersionHistoryCard";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import toast from "react-hot-toast";

interface EnhancedConfigTabProps {
  agent: Agent;
  isEditMode?: boolean;
  draftConfig?: AgentConfigSnapshot | null;
  onConfigChange?: (config: AgentConfigSnapshot) => void;
}

export function EnhancedConfigTab({
  agent,
  isEditMode = false,
  draftConfig,
  onConfigChange,
}: EnhancedConfigTabProps) {
  const { user } = useGlobalContext();
  const { restoreVersion } = useVersionHistory(agent);

  // Use draft config in edit mode, otherwise use agent data
  const displayConfig =
    isEditMode && draftConfig
      ? draftConfig
      : {
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
        };

  const [tagInput, setTagInput] = useState("");

  // Update config helper
  const updateConfig = (updates: Partial<AgentConfigSnapshot>) => {
    if (isEditMode && draftConfig && onConfigChange) {
      onConfigChange({ ...draftConfig, ...updates });
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim() || !isEditMode) return;
    const newTags = [...(draftConfig?.tags || []), tagInput.trim()];
    updateConfig({ tags: newTags });
    setTagInput("");
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!isEditMode) return;
    const newTags = (draftConfig?.tags || []).filter((t) => t !== tagToRemove);
    updateConfig({ tags: newTags });
  };

  return (
    <div className="h-full flex gap-6">
      {/* LEFT PANE: Configuration */}
      <div className="w-1/2 space-y-6 overflow-y-auto">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={displayConfig.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                disabled={!isEditMode}
                className={!isEditMode ? "bg-gray-50" : ""}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="agent-description">Description</Label>
              <Textarea
                id="agent-description"
                value={displayConfig.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                disabled={!isEditMode}
                className={`min-h-[100px] ${!isEditMode ? "bg-gray-50" : ""}`}
                placeholder="Describe what this agent does..."
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {displayConfig.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    {isEditMode && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              {isEditMode && (
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={displayConfig.modelConfig?.model || "gpt-4"}
                onValueChange={(value) =>
                  updateConfig({
                    modelConfig: {
                      model: value,
                      temperature:
                        displayConfig.modelConfig?.temperature || 0.7,
                      maxTokens: displayConfig.modelConfig?.maxTokens || 2048,
                      topP: displayConfig.modelConfig?.topP || 1.0,
                    },
                  })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger
                  id="model"
                  className={!isEditMode ? "bg-gray-50" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">
                    Claude 3 Sonnet
                  </SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperature</Label>
                <span className="text-sm text-muted-foreground">
                  {displayConfig.modelConfig?.temperature?.toFixed(2) || "0.70"}
                </span>
              </div>
              <Slider
                value={[displayConfig.modelConfig?.temperature || 0.7]}
                onValueChange={([value]) =>
                  updateConfig({
                    modelConfig: {
                      model: displayConfig.modelConfig?.model || "gpt-4",
                      ...displayConfig.modelConfig,
                      temperature: value,
                    },
                  })
                }
                disabled={!isEditMode}
                min={0}
                max={2}
                step={0.1}
                className={!isEditMode ? "opacity-50" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Higher values make output more random
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Max Tokens</Label>
                <span className="text-sm text-muted-foreground">
                  {displayConfig.modelConfig?.maxTokens || 2048}
                </span>
              </div>
              <Slider
                value={[displayConfig.modelConfig?.maxTokens || 2048]}
                onValueChange={([value]) =>
                  updateConfig({
                    modelConfig: {
                      model: displayConfig.modelConfig?.model || "gpt-4",
                      ...displayConfig.modelConfig,
                      maxTokens: value,
                    },
                  })
                }
                disabled={!isEditMode}
                min={256}
                max={4096}
                step={256}
                className={!isEditMode ? "opacity-50" : ""}
              />
            </div>

            {/* Top P */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Top P</Label>
                <span className="text-sm text-muted-foreground">
                  {displayConfig.modelConfig?.topP?.toFixed(2) || "1.00"}
                </span>
              </div>
              <Slider
                value={[displayConfig.modelConfig?.topP || 1.0]}
                onValueChange={([value]) =>
                  updateConfig({
                    modelConfig: {
                      model: displayConfig.modelConfig?.model || "gpt-4",
                      ...displayConfig.modelConfig,
                      topP: value,
                    },
                  })
                }
                disabled={!isEditMode}
                min={0}
                max={1}
                step={0.05}
                className={!isEditMode ? "opacity-50" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Nucleus sampling threshold
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Editor Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                value={displayConfig.systemPrompt}
                onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                disabled={!isEditMode}
                className={`min-h-[120px] font-mono text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                placeholder="You are a helpful AI assistant..."
              />
            </div>

            {/* User Prompt Template */}
            <div className="space-y-2">
              <Label htmlFor="user-prompt">User Prompt Template</Label>
              <Textarea
                id="user-prompt"
                value={displayConfig.userPrompt}
                onChange={(e) => updateConfig({ userPrompt: e.target.value })}
                disabled={!isEditMode}
                className={`min-h-[80px] font-mono text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                placeholder="Optional user message template..."
              />
            </div>

            {/* Assistant Prompt (Few-shot) */}
            <div className="space-y-2">
              <Label htmlFor="assistant-prompt">
                Assistant Prompt (Few-shot Example)
              </Label>
              <Textarea
                id="assistant-prompt"
                value={displayConfig.assistantPrompt}
                onChange={(e) =>
                  updateConfig({ assistantPrompt: e.target.value })
                }
                disabled={!isEditMode}
                className={`min-h-[80px] font-mono text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                placeholder="Optional assistant response example..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Button */}
        {isEditMode && (
          <Button variant="outline" className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Test Configuration
          </Button>
        )}
      </div>

      {/* RIGHT PANE: Version History & Templates */}
      <div className="w-1/2 space-y-6 overflow-y-auto">
        <VersionHistoryCard
          agent={agent}
          onRestore={(versionId) => {
            const restoredConfig = restoreVersion(versionId);
            if (restoredConfig && onConfigChange) {
              onConfigChange(restoredConfig);
              toast.success("Version restored successfully!", {
                style: { background: "#dcfce7", color: "#166534" },
              });
            }
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">
              Test results will appear here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
