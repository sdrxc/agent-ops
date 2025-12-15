"use client";

import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  Plus,
  ChevronDown,
  Check,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ToolCreationDialogBox from "./ToolCreationDialog";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { Tool } from "../../types";

interface Step2ToolsRegistryProps {
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

export default function Step2ToolsRegistry({
  sequenceID,
  projectID,
  userID,
  stepID,
  onStepValidate,
  onNext, 
  onPrevious
}: Step2ToolsRegistryProps) {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>(state.toolsRegistry || []);
  const [openDialog, setOpenDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true); // for fetching tools
  const [submitting, setSubmitting] = useState(false); // for submit button
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

      console.log("tools",response);

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
  const handleValidate = async () => {
    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

    const isLocalEnv = runtimeEnv === "local";
    const url = isLocalEnv
      ? `${baseURL}/api/step2-validate`
      : `/api/step2-validate`;

    console.log('url ', url);
    try {
      setLoading(true);
      const res = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        stepID
      });

      if (res?.data?.data?.valid === true) {
        onStepValidate(true);
      } else {
        onStepValidate(false);
      }
    } catch (err) {
      onStepValidate(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleValidate();
  }, []);



  const handleToolRegistrySubmit = async () => {
    if (selectedTools.length === 0) {
      toast.error("Please select at least one tool before submitting.");
      onStepValidate(false);
      return;
    }

    const url = isLocalEnv ? `${baseURL}/api/step2-toolRegistry` : `/api/step2-toolRegistry`;

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

      console.log("response in step2", response)
      if (response.status == 200 || response.status == 201) {

        toast.success("Tool Registered Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        toast.success("Click on Next to proceed", {
          style: { background: "#dcfce7", color: "#166534" },
        });        

        onStepValidate(true); // only after API confirms success
      } else {
        onStepValidate(false);
      }
    } catch (err) {
      console.error("Validation error:", err);
      onStepValidate(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-3 p-4 shadow-lg rounded-xl">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
          <Wrench className="h-6 w-6 text-blue-600" />
          <span>Tools Registry</span>
        </CardTitle>
        <div className="text-xs text-gray-500">
          Add a new tool or use available tools
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Section 1: Create Tool */}
        <div
          className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          onClick={() => setOpenDialog(true)}
        >
          <div className="flex items-center gap-2 font-medium text-lg">
            <Plus className="h-5 w-5 text-green-600" />
            <span>Create Tool</span>
          </div>
        </div>

        <Separator />

        {/* Section 2: Available Tools */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-xs relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 font-medium text-lg">
              <UploadCloud className="h-5 w-5 text-blue-600" />
              <span>Available Tools</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={fetchTools}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between border rounded-md px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >
              {selectedTools.length > 0
                ? `${selectedTools.length} Tool(s) selected`
                : "Select Tools"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute mt-2 w-full border rounded-md bg-white dark:bg-gray-700 shadow-lg z-10 max-h-60 overflow-auto">
                {loading ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Loading tools...
                  </div>
                ) : error ? (
                  <div className="px-4 py-2 text-sm text-red-500">{error}</div>
                ) : tools.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No tools available
                  </div>
                ) : (
                  tools.map((tool) => (
                    <label
                      key={tool.toolID}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedTools.some((t) => t.toolID === tool.toolID)}
                        onChange={() => toggleToolSelection(tool)}
                      />
                      <div className="w-5 h-5 flex items-center justify-center border rounded-md">
                        {selectedTools.some((t) => t.toolID === tool.toolID) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <span>
                        {tool.toolName}{" "}
                        <span className="text-xs text-gray-500">
                          ({tool.toolID})
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full flex items-center gap-2"
          disabled={submitting || selectedTools.length === 0}
          onClick={handleToolRegistrySubmit}
        >
          {submitting ? "Submitting..." : "Submit Tool Configuration"}
        </Button>
      </CardContent>

      {/* Dialog for Tool Creation */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Create New Tool</DialogTitle>
          </DialogHeader>
          <ToolCreationDialogBox onClose={() => setOpenDialog(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}