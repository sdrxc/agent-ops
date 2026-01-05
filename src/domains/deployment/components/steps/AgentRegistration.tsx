"use client";

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { UploadCloud, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import axios from "axios";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { validateAgentRegistry } from "../utils/validators";

// Git validation and SDK scanning
import {
  ValidationState,
  isValidGitHubUrl,
  isBayerOrg,
  validateRepositoryUrl,
} from "../../utils/gitValidation";
import {
  ScanState,
  scanRepository,
  createScanAbortController,
  hasPrefillData,
} from "../../services/sdkScanner";

// Sub-components
import { JsonEditorTab } from "./Step1AgentRegistry/JsonEditorTab";
import { JsonUploadTab } from "./Step1AgentRegistry/JsonUploadTab";
import { BasicFieldsSection } from "./Step1AgentRegistry/BasicFieldsSection";
import { CapabilitiesSection } from "./Step1AgentRegistry/CapabilitiesSection";
import { SkillsSection } from "./Step1AgentRegistry/SkillsSection";
import { SecurityPoliciesSection } from "./Step1AgentRegistry/SecurityPoliciesSection";

interface AgentRegistrationProps {
  sequenceID: string;
  projectID: string;
  userID: string | null;
  onNext: () => void;
  onStepValidate: (isValid: boolean) => void;
  stepID: string;
}

export default function AgentRegistration({
  sequenceID,
  projectID,
  userID,
  onNext,
  onStepValidate,
  stepID,
}: AgentRegistrationProps) {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const { agentRegistry } = state;
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [activeTab, setActiveTab] = useState<"visual" | "json" | "upload">(
    "visual"
  );
  const [localData, setLocalData] = useState(agentRegistry);

  // Validation States
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [hasScrolledToError, setHasScrolledToError] = useState(false);

  // JSON Editor/Upload States
  const [jsonEditorValue, setJsonEditorValue] = useState<string>(
    JSON.stringify(localData, null, 2)
  );
  const [isJsonValid, setIsJsonValid] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [isUploadedJsonValid, setIsUploadedJsonValid] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================================================================
  // Git URL Validation State
  // =========================================================================
  const [validationState, setValidationState] = useState<ValidationState>({
    status: "idle",
  });

  // =========================================================================
  // SDK Scan State
  // =========================================================================
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const scanAbortControllerRef = useRef<AbortController | null>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);

  // =========================================================================
  // URL Validation Logic
  // =========================================================================
  const handleRepoUrlChange = useCallback(async (url: string) => {
    // Update local data
    setLocalData((prev: any) => {
      const updated = { ...prev, repoUrl: url, branch: "" }; // Reset branch on URL change
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });

    // Reset states
    setIsPreFilled(false);
    setScanState({ status: "idle" });

    // Cancel any ongoing scan
    if (scanAbortControllerRef.current) {
      scanAbortControllerRef.current.abort();
      scanAbortControllerRef.current = null;
    }

    // Empty URL - reset to idle
    if (!url || url.trim() === "") {
      setValidationState({ status: "idle" });
      return;
    }

    // Start validation
    setValidationState({ status: "validating" });

    // Step 1: Local validation - valid GitHub URL?
    if (!isValidGitHubUrl(url)) {
      setValidationState({
        status: "invalid",
        message: "Not a valid GitHub URL format",
      });
      return;
    }

    // Step 2: Local validation - Bayer org?
    if (!isBayerOrg(url)) {
      setValidationState({
        status: "not-bayer",
        message:
          "Repository must be from bayer-int or Bayer-Group organization",
      });
      return;
    }

    // Step 3: Remote check - can we access the repo?
    setValidationState({ status: "checking-access" });

    try {
      const result = await validateRepositoryUrl(url);
      setValidationState(result);
    } catch (error) {
      setValidationState({
        status: "access-denied",
        message: "Failed to validate repository access",
      });
    }
  }, []);

  // Debounced URL validation
  useEffect(() => {
    const repoUrl = localData.repoUrl || "";

    // Skip if URL hasn't changed or is being edited
    if (!repoUrl) return;

    const timer = setTimeout(() => {
      // Only re-validate if not already validating and status is idle
      if (validationState.status === "idle") {
        handleRepoUrlChange(repoUrl);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localData.repoUrl]);

  // =========================================================================
  // Branch Selection & SDK Scanning
  // =========================================================================
  const handleBranchChange = useCallback(
    async (branch: string) => {
      // Update local data
      setLocalData((prev: any) => {
        const updated = { ...prev, branch };
        setJsonEditorValue(JSON.stringify(updated, null, 2));
        return updated;
      });

      // Reset pre-fill state
      setIsPreFilled(false);

      // Cancel any ongoing scan
      if (scanAbortControllerRef.current) {
        scanAbortControllerRef.current.abort();
        scanAbortControllerRef.current = null;
      }

      // Don't scan if no branch selected or no repo URL
      if (!branch || !localData.repoUrl) {
        setScanState({ status: "idle" });
        return;
      }

      // Start new scan
      const abortController = createScanAbortController();
      scanAbortControllerRef.current = abortController;

      setScanState({
        status: "scanning",
        progress: 0,
        message: "Connecting to repository...",
      });

      try {
        const result = await scanRepository(
          localData.repoUrl,
          branch,
          abortController.signal,
          (progress, message) => {
            setScanState((prev) => ({ ...prev, progress, message }));
          }
        );

        setScanState({ status: "completed", result });

        // Pre-fill form if SDK was detected
        if (hasPrefillData(result)) {
          setIsPreFilled(true);

          setLocalData((prev: any) => {
            const updated = {
              ...prev,
              name: result.agentName || prev.name,
              version: result.version || prev.version,
              url: result.endpoint || prev.url,
              skills: result.skills.length > 0 ? result.skills : prev.skills,
              capabilities:
                Object.keys(result.capabilities).length > 0
                  ? result.capabilities
                  : prev.capabilities,
            };
            setJsonEditorValue(JSON.stringify(updated, null, 2));
            return updated;
          });

          toast.success("SDK detected! Fields pre-filled from your code.", {
            icon: "✨",
            style: { background: "#dcfce7", color: "#166534" },
          });
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          setScanState({ status: "cancelled", message: "Scan cancelled" });
        } else {
          setScanState({
            status: "failed",
            error: error.message || "Scan failed",
          });
          toast.error("Failed to scan repository");
        }
      }
    },
    [localData.repoUrl]
  );

  // Cancel scan handler
  const handleCancelScan = useCallback(() => {
    if (scanAbortControllerRef.current) {
      scanAbortControllerRef.current.abort();
      scanAbortControllerRef.current = null;
    }
    setScanState({ status: "cancelled", message: "Scan cancelled by user" });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanAbortControllerRef.current) {
        scanAbortControllerRef.current.abort();
      }
    };
  }, []);

  // =========================================================================
  // Form Handlers
  // =========================================================================
  const handleChange = (field: string, value: any) => {
    setLocalData((prev: any) => {
      const updated = { ...prev, [field]: value };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
    setLocalErrors((prev) =>
      prev.filter((err) => !err.toLowerCase().includes(field.toLowerCase()))
    );

    // If user manually edits a pre-filled field, clear pre-filled indicator
    if (
      isPreFilled &&
      ["name", "version", "url", "description"].includes(field)
    ) {
      // Don't clear if just selecting a value that matches pre-filled
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);
    setUploadErrors(null);
    setIsUploadedJsonValid(false);
    setJsonData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        const validationErrors = validateAgentRegistry(parsed);

        if (validationErrors.length > 0) {
          setUploadErrors(
            `Invalid JSON content:\n${validationErrors.join(", ")}`
          );
          setIsUploadedJsonValid(false);
        } else {
          setUploadErrors(null);
          setIsUploadedJsonValid(true);
          setJsonData(parsed);
          setJsonEditorValue(JSON.stringify(parsed, null, 2));
          setLocalData(parsed);
        }
      } catch {
        setUploadErrors("Uploaded file contains invalid JSON.");
        setJsonData(null);
        setIsUploadedJsonValid(false);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonEditorChange = (value: string) => {
    setJsonEditorValue(value);
    try {
      const parsed = JSON.parse(value);
      setUploadErrors(null);
      setJsonData(parsed);
      setLocalData(parsed);

      const validationErrors = validateAgentRegistry(parsed);
      if (validationErrors.length > 0) {
        setLocalErrors(validationErrors);
        setIsJsonValid(false);
      } else {
        setLocalErrors([]);
        setIsJsonValid(true);
      }
    } catch {
      setUploadErrors("Invalid JSON format.");
      setJsonData(null);
      setIsJsonValid(false);
    }
  };

  // Capability handlers
  const handleCapabilityChange = (key: string, value: string | boolean) => {
    setLocalData((prev: any) => {
      const updatedCapabilities = { ...prev.capabilities, [key]: value };
      const updated = { ...prev, capabilities: updatedCapabilities };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleRemoveCapability = (key: string) => {
    setLocalData((prev: any) => {
      const { [key]: _, ...rest } = prev.capabilities;
      const updated = { ...prev, capabilities: rest };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  // Skill handlers
  const handleUpdateSkill = (index: number, field: string, value: string) => {
    setLocalData((prev: any) => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = { ...updatedSkills[index], [field]: value };
      const updated = { ...prev, skills: updatedSkills };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleAddSkill = () => {
    setLocalData((prev: any) => {
      const newSkill = { key: "", description: "" };
      const updated = { ...prev, skills: [...prev.skills, newSkill] };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleRemoveSkill = (index: number) => {
    setLocalData((prev: any) => {
      const updatedSkills = prev.skills.filter(
        (_: any, idx: number) => idx !== index
      );
      const updated = { ...prev, skills: updatedSkills };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  // Security policy handlers
  const handleUpdateSecurityPolicy = (
    index: number,
    field: string,
    value: any
  ) => {
    setLocalData((prev: any) => {
      const updatedSecurity = [...prev.security];
      updatedSecurity[index] = { ...updatedSecurity[index], [field]: value };
      const updated = { ...prev, security: updatedSecurity };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleAddSecurityPolicy = () => {
    setLocalData((prev: any) => {
      const newPolicy = { policy_name: "", details: "", enforced: false };
      const updated = { ...prev, security: [...prev.security, newPolicy] };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleRemoveSecurityPolicy = (index: number) => {
    setLocalData((prev: any) => {
      const updatedSecurity = prev.security.filter(
        (_: any, idx: number) => idx !== index
      );
      const updated = { ...prev, security: updatedSecurity };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  // =========================================================================
  // Submission
  // =========================================================================
  const handleAgentRegistrySubmit = async () => {
    setLocalErrors([]);
    dispatch({ type: "SET_ERRORS", payload: [] });

    const validationErrors = validateAgentRegistry(localData);

    if (validationErrors.length > 0) {
      setLocalErrors(validationErrors);
      dispatch({ type: "SET_ERRORS", payload: validationErrors });

      if (!hasScrolledToError) {
        const firstError = validationErrors[0].toLowerCase();
        const fieldKey = Object.keys(inputRefs.current).find((key) =>
          firstError.includes(key.toLowerCase())
        );
        if (fieldKey && inputRefs.current[fieldKey]) {
          inputRefs.current[fieldKey]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          inputRefs.current[fieldKey]?.focus();
          setHasScrolledToError(true);
        }
      }
      return;
    }

    try {
      setLoading(true);
      dispatch({ type: "SET_LOADING", payload: true });

      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint =
        runtimeEnv === "local"
          ? `${baseURL}/api/step1-agentRegistry`
          : "/api/step1-agentRegistry";

      const response = await axios.post(endpoint, {
        projectID,
        sequenceID,
        userID,
        agentRegistryData: localData,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Agent Registered Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        onStepValidate(true);
        dispatch({ type: "SET_AGENT_REGISTRY", payload: localData });
        setHasScrolledToError(false);

        // onNext(); // Advance removed
      } else {
        toast.error("Agent Registration Failed");
        onStepValidate(false);
      }
    } catch (error: any) {
      console.error("Agent registry submit error:", error);
      onStepValidate(false);
      setLocalErrors([error?.message || "Unknown error"]);
    } finally {
      setLoading(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Initial validation check
  useEffect(() => {
    const checkValidation = async () => {
      try {
        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";
        const url = isLocalEnv
          ? `${baseURL}/api/step1-validate`
          : `/api/step1-validate`;

        const res = await axios.post(url, {
          projectID,
          sequenceID,
          userID,
          stepID,
        });
        if (res?.data?.data?.valid === true) onStepValidate(true);
      } catch (e) {
        /* silent fail */
      }
    };
    checkValidation();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        defaultValue="visual"
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="visual">
            <Edit className="mr-2 w-4 h-4" /> Visual Editor
          </TabsTrigger>
          <TabsTrigger value="json">
            <Eye className="mr-2 w-4 h-4" /> JSON Editor
          </TabsTrigger>
          <TabsTrigger value="upload">
            <UploadCloud className="mr-2 w-4 h-4" /> Upload JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          <BasicFieldsSection
            localData={localData}
            localErrors={localErrors}
            inputRefs={inputRefs}
            onFieldChange={handleChange}
            validationState={validationState}
            onRepoUrlChange={handleRepoUrlChange}
            onBranchChange={handleBranchChange}
            scanState={scanState}
            onCancelScan={handleCancelScan}
            isPreFilled={isPreFilled}
          />
          <Separator />
          <CapabilitiesSection
            capabilities={localData.capabilities || {}}
            onCapabilityChange={handleCapabilityChange}
            onRemoveCapability={handleRemoveCapability}
          />
          <Separator />
          <SkillsSection
            skills={localData.skills || []}
            onUpdateSkill={handleUpdateSkill}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            isPreFilled={
              isPreFilled &&
              scanState.result?.skills &&
              scanState.result.skills.length > 0
            }
          />
          <Separator />
          <SecurityPoliciesSection
            security={localData.security || []}
            onUpdateSecurityPolicy={handleUpdateSecurityPolicy}
            onAddSecurityPolicy={handleAddSecurityPolicy}
            onRemoveSecurityPolicy={handleRemoveSecurityPolicy}
          />

          <div className="pt-6 flex justify-end">
            <Button
              variant="default"
              size="lg"
              className="w-full md:w-auto"
              onClick={handleAgentRegistrySubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="json">
          <JsonEditorTab
            jsonEditorValue={jsonEditorValue}
            onJsonEditorChange={handleJsonEditorChange}
            isJsonValid={isJsonValid}
            errors={uploadErrors}
            localErrors={localErrors}
            loading={loading}
            onSubmit={handleAgentRegistrySubmit}
          />
        </TabsContent>

        <TabsContent value="upload">
          <JsonUploadTab
            jsonFile={jsonFile}
            jsonData={jsonData}
            errors={uploadErrors}
            isUploadedJsonValid={isUploadedJsonValid}
            loading={loading}
            onFileChange={handleFileChange}
            onSubmit={handleAgentRegistrySubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
