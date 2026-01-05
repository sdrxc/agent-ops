"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  X,
  Github,
  GitBranch,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ValidationState } from "@/domains/deployment/utils/gitValidation";
import { ScanState } from "@/domains/deployment/services/sdkScanner";

interface BasicFieldsSectionProps {
  localData: any;
  localErrors: string[];
  inputRefs: React.RefObject<Record<string, HTMLInputElement | null>>;
  onFieldChange: (field: string, value: any) => void;
  // Git validation props
  validationState: ValidationState;
  onRepoUrlChange: (url: string) => void;
  onBranchChange: (branch: string) => void;
  // Scan props
  scanState: ScanState;
  onCancelScan?: () => void;
  // Pre-fill indicator
  isPreFilled?: boolean;
}

// Mode selector component (declared outside to avoid recreating on each render)
interface ModeSelectorProps {
  title: string;
  field: string;
  modes: string[];
  onFieldChange: (field: string, value: string[]) => void;
}

function ModeSelector({ title, field, modes, onFieldChange }: ModeSelectorProps) {
  const handleRemoveMode = (modeToRemove: string) => {
    const updated = modes.filter((m) => m !== modeToRemove);
    onFieldChange(field, updated);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {modes.map((mode, idx) => (
          <Badge key={idx} variant="secondary" className="px-2 py-1 gap-1">
            {mode}
            <X
              className="w-3 h-3 cursor-pointer hover:text-foreground text-muted-foreground"
              onClick={() => handleRemoveMode(mode)}
            />
          </Badge>
        ))}
        {modes.length === 0 && (
          <span className="text-sm text-muted-foreground/80 italic">
            None
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {["text", "image", "audio"].map((m) => (
          <Badge
            key={m}
            variant={modes.includes(m) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              !modes.includes(m)
                ? onFieldChange(field, [...modes, m])
                : handleRemoveMode(m)
            }
          >
            {m}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function BasicFieldsSection({
  localData,
  localErrors,
  inputRefs,
  onFieldChange,
  validationState,
  onRepoUrlChange,
  onBranchChange,
  scanState,
  onCancelScan,
  isPreFilled = false,
}: BasicFieldsSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper to set input refs without triggering immutability lint errors
  const setInputRef = (key: string) => (el: HTMLInputElement | null) => {
    const refs = inputRefs.current;
    if (refs) {
      refs[key] = el;
    }
  };

  const hasError = (field: string) =>
    localErrors.find((e) => e.toLowerCase().includes(field.toLowerCase()));
  const getError = (field: string) =>
    localErrors.find((e) => e.toLowerCase().includes(field.toLowerCase()));

  const repoUrl = localData.repoUrl || "";
  const branch = localData.branch || "";

  // Derive UI states from validation state
  const isValidating =
    validationState.status === "validating" ||
    validationState.status === "checking-access";
  const isValid = validationState.status === "valid";
  const hasValidationError = ["invalid", "not-bayer", "access-denied"].includes(
    validationState.status
  );
  const branches = validationState.branches || [];

  // Get appropriate border color based on validation state
  const getInputBorderClass = () => {
    if (hasValidationError) {
      return validationState.status === "not-bayer"
        ? "border-warning focus-visible:ring-warning"
        : "border-destructive focus-visible:ring-destructive";
    }
    if (isValid) return "border-success focus-visible:ring-success";
    return "border-border focus-visible:ring-primary";
  };

  // Compute validation status icon inline to avoid static component issues
  const validationIcon = isValidating ? (
    <Loader2 className="w-5 h-5 text-primary animate-spin" />
  ) : validationState.status === "valid" ? (
    <CheckCircle className="w-5 h-5 text-success" />
  ) : validationState.status === "invalid" ? (
    <XCircle className="w-5 h-5 text-destructive" />
  ) : validationState.status === "not-bayer" ? (
    <AlertTriangle className="w-5 h-5 text-warning" />
  ) : validationState.status === "access-denied" ? (
    <AlertCircle className="w-5 h-5 text-destructive" />
  ) : null;


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 0. Code Repository (Git URL) - Essential for pre-filling */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Code Repository</h3>
          <p className="text-sm text-muted-foreground">
            Link your Bayer GitHub repository to auto-detect SDK and pre-fill
            metadata
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Repository URL Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Repository URL <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="https://github.com/bayer-int/your-repo"
                value={repoUrl}
                onChange={(e) => onRepoUrlChange(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-10 py-2.5",
                  getInputBorderClass()
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validationIcon}
              </div>
            </div>

            {/* Validation Message */}
            {validationState.status === "validating" && (
              <p className="text-xs text-primary flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Validating URL
                format...
              </p>
            )}
            {validationState.status === "checking-access" && (
              <p className="text-xs text-primary flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking repository
                access...
              </p>
            )}
            {validationState.status === "invalid" && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <XCircle className="w-3 h-3" />{" "}
                {validationState.message || "Not a valid GitHub URL"}
              </p>
            )}
            {validationState.status === "not-bayer" && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{" "}
                {validationState.message ||
                  "Repository must be from a Bayer organization"}
              </p>
            )}
            {validationState.status === "access-denied" && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{" "}
                {validationState.message || "Unable to access repository"}
              </p>
            )}
            {validationState.status === "idle" && repoUrl === "" && (
              <p className="text-xs text-muted-foreground">
                Paste a GitHub URL from{" "}
                <span className="font-medium">bayer-int</span> or{" "}
                <span className="font-medium">Bayer-Group</span>
              </p>
            )}
            {isValid && (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Repository validated
                successfully
              </p>
            )}
          </div>

          {/* Branch Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Branch <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={branch}
                onChange={(e) => onBranchChange(e.target.value)}
                disabled={!isValid || isValidating}
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 bg-background border rounded-lg focus:ring-2 outline-none transition-colors appearance-none h-[42px]",
                  isValid && branch
                    ? "border-success focus:ring-success"
                    : "border-border focus:ring-primary",
                  (!isValid || isValidating) && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="">
                  {isValidating
                    ? "Validating..."
                    : !isValid
                      ? "Enter valid URL first"
                      : "Select a branch"}
                </option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {isValid
                ? "Select a branch to scan for Agentrix SDK"
                : "Available after URL validation"}
            </p>
          </div>
        </div>

        {/* Scanning Progress */}
        {scanState.status === "scanning" && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm font-medium text-foreground">
                  {scanState.message || "Scanning for Agentrix SDK..."}
                </span>
              </div>
              {onCancelScan && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelScan}
                  className="h-7 px-2"
                >
                  Cancel
                </Button>
              )}
            </div>
            {scanState.progress !== undefined && (
              <div className="w-full bg-primary/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanState.progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* SDK Detection Banner */}
        {scanState.status === "completed" && scanState.result && (
          <div
            className={cn(
              "mt-4 p-4 rounded-lg",
              scanState.result.sdkDetected ? "bg-success/10" : "bg-warning/10"
            )}
          >
            {scanState.result.sdkDetected ? (
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-success-foreground">
                    Agentrix SDK Detected!
                  </p>
                  <p className="text-sm text-success-foreground/80 mt-1">
                    Found {scanState.result.skills.length} skill
                    {scanState.result.skills.length !== 1 ? "s" : ""} and{" "}
                    {Object.keys(scanState.result.capabilities).length}{" "}
                    capabilit
                    {Object.keys(scanState.result.capabilities).length !== 1
                      ? "ies"
                      : "y"}
                    . Fields have been pre-filled from your code.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-warning-foreground">
                    Agentrix SDK Not Detected
                  </p>
                  <p className="text-sm text-warning-foreground/80 mt-1">
                    No{" "}
                    <code className="text-xs bg-warning/20 px-1 py-0.5 rounded">
                      @trace_agent_call
                    </code>{" "}
                    decorators found. Please fill in the agent details manually
                    below, or consider using the{" "}
                    <a
                      href="https://github.com/bayer-int/agentrix-sdk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80"
                    >
                      Agentrix SDK
                    </a>{" "}
                    for automatic instrumentation.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1. Core Identity */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Agent Identity</h3>
          <p className="text-sm text-muted-foreground">
            Basic information about your agent
          </p>
        </div>

        {/* Pre-filled indicator */}
        {isPreFilled && (
          <div className="flex items-center gap-2 text-success text-sm -mt-2">
            <Sparkles className="w-4 h-4" />
            <span>Auto-filled from SDK scan</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="agentName" className="text-base font-semibold">
              Agent Name <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1">
              <Input
                id="agentName"
                ref={setInputRef("name")}
                value={localData.name || ""}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="e.g. Finance Assistant"
                className={cn(
                  "h-12 text-lg transition-colors",
                  hasError("name")
                    ? "border-destructive focus-visible:ring-destructive"
                    : "",
                  isPreFilled && localData.name ? "bg-success/10" : ""
                )}
              />
              {hasError("name") && (
                <p className="text-destructive text-sm mt-1">
                  {getError("name")}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="agentVersion" className="text-base font-semibold">
              Version <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1">
              <Input
                id="agentVersion"
                ref={setInputRef("version")}
                value={localData.version || ""}
                onChange={(e) => onFieldChange("version", e.target.value)}
                placeholder="0.1.0"
                className={cn(
                  "h-12 text-lg font-mono",
                  hasError("version") ? "border-destructive" : "",
                  isPreFilled && localData.version ? "bg-success/10" : ""
                )}
              />
              {hasError("version") && (
                <p className="text-destructive text-sm mt-1">
                  {getError("version")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="agentDescription">
            Description <span className="text-destructive">*</span>
          </Label>
          <Input
            id="agentDescription"
            ref={setInputRef("description")}
            value={localData.description || ""}
            onChange={(e) => onFieldChange("description", e.target.value)}
            placeholder="Briefly describe what this agent does..."
            className={cn(
              "mt-1",
              hasError("description") ? "border-destructive" : ""
            )}
          />
          {hasError("description") && (
            <p className="text-destructive text-sm mt-1">
              {getError("description")}
            </p>
          )}
        </div>
      </div>

      {/* 2. Interaction Modes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Interaction & IO</h3>
          <p className="text-sm text-muted-foreground">
            Define how your agent communicates
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ModeSelector
            title="Supported Inputs"
            field="input_modes"
            modes={(localData.input_modes || []) as string[]}
            onFieldChange={onFieldChange}
          />
          <ModeSelector
            title="Supported Outputs"
            field="output_modes"
            modes={(localData.output_modes || []) as string[]}
            onFieldChange={onFieldChange}
          />
        </div>

        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <Checkbox
              checked={localData.supports_authenticated_extended_card || false}
              onCheckedChange={(c) =>
                onFieldChange(
                  "supports_authenticated_extended_card",
                  c === true
                )
              }
            />
            <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
              Supports Authenticated Extended Card
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <Checkbox
              checked={localData.feedback_enabled || false}
              onCheckedChange={(c) =>
                onFieldChange("feedback_enabled", c === true)
              }
            />
            <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
              Enable User Feedback Loop
            </span>
          </label>
        </div>
      </div>

      {/* 3. Connection & Endpoint */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Agent Endpoint</h3>
          <p className="text-sm text-muted-foreground">
            The base URL where the agent receives MCP requests
          </p>
        </div>
        <div>
          <Label htmlFor="agentURL" className="text-sm font-medium">
            URL <span className="text-destructive">*</span>
          </Label>
          <div className="mt-1 relative">
            <span className="absolute left-3 top-3 text-muted-foreground font-mono">
              https://
            </span>
            <Input
              id="agentURL"
              ref={setInputRef("url")}
              value={(localData.url || "").replace("https://", "")}
              onChange={(e) =>
                onFieldChange(
                  "url",
                  `https://${e.target.value.replace("https://", "")}`
                )
              }
              placeholder="api.my-agent.com/v1"
              className={cn(
                "pl-16 h-11 font-mono",
                hasError("url") ? "border-destructive" : ""
              )}
            />
            {hasError("url") && (
              <p className="text-destructive text-sm mt-1">{getError("url")}</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Advanced Settings */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-muted-foreground hover:text-foreground p-0 h-auto font-normal flex items-center gap-1"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
        </Button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="protocolVersion"
                className="text-xs text-muted-foreground uppercase"
              >
                Protocol Version
              </Label>
              <Input
                id="protocolVersion"
                value={localData.protocol_version || ""}
                onChange={(e) =>
                  onFieldChange("protocol_version", e.target.value)
                }
                placeholder="e.g. 1.0"
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label
                htmlFor="preferredTransport"
                className="text-xs text-muted-foreground uppercase"
              >
                Preferred Transport
              </Label>
              <Input
                id="preferredTransport"
                value={localData.preferred_transport || ""}
                onChange={(e) =>
                  onFieldChange("preferred_transport", e.target.value)
                }
                placeholder="e.g. sse"
                className="mt-1 bg-background"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
