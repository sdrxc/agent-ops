"use client";

import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  ChevronDown,
  Check,
  RefreshCw,
  Wrench,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { Tool } from "../../types";

interface ToolConfigurationProps {
  sequenceID: string;
  projectID: string;
  userID: string;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Base environment logic
const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";

export default function ToolConfiguration({
  sequenceID,
  projectID,
  userID,
  stepID,
  onStepValidate,
  onNext,
  onPrevious,
}: ToolConfigurationProps) {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>(
    state.toolsRegistry || []
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true); // for fetching tools
  const [submitting, setSubmitting] = useState(false); // for submit button
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save to context whenever tools change
  useEffect(() => {
    dispatch({ type: "SET_TOOLS_REGISTRY", payload: selectedTools });
    onStepValidate(selectedTools.length > 0);
  }, [selectedTools]);

  // Fetch tools from API
  const fetchTools = async () => {
    const url = isLocalEnv ? `${baseURL}/api/listTools` : `/api/listTools`;
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(url, {
        userID,
        projectID,
      });

      if (response.data && response.data?.data?.tools.length > 0) {
        setTools(response.data.data.tools);
      } else {
        setTools([]); // no tools available
      }
    } catch (err) {
      console.error("Error fetching tools:", err);
      setError("Failed to load tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  // Load tools on mount
  useEffect(() => {
    fetchTools();
  }, [userID, projectID]);

  // Toggle tool selection
  const toggleToolSelection = (tool: Tool) => {
    setSelectedTools((prev) => {
      const exists = prev.some((t) => t.toolID === tool.toolID);
      if (exists) {
        return prev.filter((t) => t.toolID !== tool.toolID);
      } else {
        return [...prev, tool];
      }
    });
  };

  // handle step validation
  useEffect(() => {
    const handleValidate = async () => {
      const url = isLocalEnv
        ? `${baseURL}/api/step2-validate`
        : `/api/step2-validate`;
      try {
        // setLoading(true); // Don't block UI with loading state for validation check
        const res = await axios.post(url, {
          projectID,
          sequenceID,
          userID,
          stepID,
        });
        if (res?.data?.data?.valid === true) onStepValidate(true);
      } catch (err) {
        // silent fail
      }
    };
    handleValidate();
  }, []);

  const handleToolRegistrySubmit = async () => {
    if (selectedTools.length === 0) {
      toast.error("Please select at least one tool before submitting.");
      onStepValidate(false);
      return;
    }

    const url = isLocalEnv
      ? `${baseURL}/api/step2-toolRegistry`
      : `/api/step2-toolRegistry`;

    setSubmitting(true);
    try {
      const selectedToolData = tools.filter((t) =>
        selectedTools.some((sel) => sel.toolID === t.toolID)
      );

      const response = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        selectedToolData,
      });

      if (response.status == 200 || response.status == 201) {
        toast.success("Tools Updated Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        onStepValidate(true);
        // onNext(); // Advance removed
      } else {
        onStepValidate(false);
        toast.error("Failed to register tools.");
      }
    } catch (err) {
      console.error("Validation error:", err);
      onStepValidate(false);
      toast.error("Failed to register tools.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" /> Tools & Integrations
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure external tools and APIs for your agent.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Selection Area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-muted-foreground" />
              Available Tools
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchTools}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search available tools..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background border-none rounded-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedTools.length} selected
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading tools library...
                </div>
              ) : error ? (
                <div className="py-12 text-center text-destructive">
                  {error}
                </div>
              ) : tools.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No tools found.
                </div>
              ) : (
                tools.map((tool) => {
                  const isSelected = selectedTools.some(
                    (t) => t.toolID === tool.toolID
                  );
                  return (
                    <div
                      key={tool.toolID}
                      onClick={() => toggleToolSelection(tool)}
                      className={`
                                        flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                                        ${
                                          isSelected
                                            ? "bg-primary/10 border-primary/20"
                                            : "bg-card border-transparent hover:bg-muted hover:border-border"
                                        }
                                    `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-border bg-background"}`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {tool.toolName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tool.description || tool.toolID}
                          </div>
                        </div>
                        {/* {tool.source && <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">{tool.source || 'Local'}</span>} */}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="default"
            size="lg"
            className="w-full md:w-auto"
            onClick={handleToolRegistrySubmit}
            disabled={submitting || selectedTools.length === 0}
          >
            {submitting ? "Saving..." : "Update Tools"}
          </Button>
        </div>
      </div>
    </div>
  );
}
