"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Play } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

interface AgentTestDialogProps {
  open: boolean;
  onClose: () => void;
  agent: {
    id: string;
    name: string;
    version: string;
    status: string;
    description?: string
    agentAPI?: string
  };
}

export function AgentTestDialog({ open, onClose, agent }: AgentTestDialogProps) {
  const [jsonData, setJsonData] = useState<any>(null);
  const [manualJson, setManualJson] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("paste"); // ✅ default to Paste JSON

  // const BASH_AGENT_URL =
  //   "http://k8s-project1-project1-ff918cc094-256026767.us-east-1.elb.amazonaws.com/agent-5002/run_bash_agent";

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setJsonData(parsed);
        toast.success("JSON loaded successfully!");
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setJsonData(parsed);
        toast.success("JSON loaded successfully!");
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Run the test (direct call to Bash agent)
const handleRunTest = async () => {
  let inputJson = jsonData;

  if (activeTab === "paste") {
    try {
      inputJson = JSON.parse(manualJson);
    } catch {
      toast.error("Invalid JSON format in editor");
      return;
    }
  }

  if (!inputJson) {
    toast.error("Please upload or paste a valid JSON input first");
    return;
  }

  // ✅ Ensure agent.agentAPI is defined and valid string
  if (!agent?.agentAPI || typeof agent.agentAPI !== "string") {
    toast.error("Agent API URL is missing or invalid");
    return;
  }

  const AGENT_API_URL: string = agent.agentAPI;

  setIsRunning(true);
  setResponseData(null);

  try {
    const { data } = await axios.post(AGENT_API_URL, inputJson, {
      headers: { "Content-Type": "application/json" },
    });

    const formattedResponse = {
      status: data.status || "success",
      messages: data.messages || [],
      tools_used: data.tools_used || [],
      final_output: data.final_output || "No tool calls; reasoning complete.",
    };

    setResponseData(formattedResponse);
    toast.success("Test executed successfully!");
  } catch (error: any) {
    console.error("Error calling agent:", error);
    toast.error("Failed to execute test");
    setResponseData({
      status: "error",
      message: error?.response?.data?.message || "Agent API call failed",
    });
  } finally {
    setIsRunning(false);
  }
};




  const [showAPI, setShowAPI] = useState(false);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ✅ Make entire dialog scrollable vertically */}
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          {/* Title */}
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-bold">{agent.name}</span>
          </DialogTitle>

                    {/* Version */}
          <DialogDescription className="text-xs text-gray-400">
            <span className="font-medium">Version:</span> {agent.version}
          </DialogDescription>

          {/* Description */}
          {agent.description && (
            <DialogDescription className="text-xs text-gray-600 dark:text-gray-300">
              {agent.description}
            </DialogDescription>
          )}



          {/* API Key Section */}
          {agent.agentAPI && (
            <div className="mt-2 flex items-center justify-between rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2">
              <div className="flex items-center text-xs gap-2">
                <span className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                  Agent API:
                </span>

                <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  <span className="text-gray-700 dark:text-gray-200 font-mono whitespace-nowrap">
                    {showAPI ? agent.agentAPI : "••••••••••••••••••••••"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowAPI(!showAPI)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showAPI ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
        </DialogHeader>

        {/* Tabs for Upload / Paste */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 w-64 mb-4">
            <TabsTrigger value="paste">Paste JSON</TabsTrigger>
            <TabsTrigger value="upload">Upload JSON</TabsTrigger>
          </TabsList>

          {/* ✅ Paste JSON (default) */}
          <TabsContent value="paste">
            <div className="relative">
              <textarea
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                placeholder='Paste your JSON here (e.g., {"prompt": "How many files are in this directory?"})'
                className="w-full h-40 p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-100 resize-none overflow-y-auto focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </TabsContent>

          {/* Upload JSON Tab */}
          <TabsContent value="upload">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 dark:border-gray-700"
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drag and drop a JSON file here, or click to upload
              </p>
              <input
                type="file"
                accept=".json"
                className="hidden"
                id="json-upload"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="json-upload"
                className="text-primary text-sm font-medium cursor-pointer hover:underline"
              >
                Browse Files
              </label>
            </div>

            {jsonData && (
              <div className="mt-4 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono max-h-64 overflow-auto border border-gray-300/30">
                <pre className="whitespace-pre-wrap break-all text-gray-800 dark:text-gray-100">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Run Button */}
        <div className="mt-4 flex justify-end">
          <Button
            disabled={isRunning}
            onClick={handleRunTest}
            className="bg-linear-to-r from-primary to-primary/90 text-white shadow-lg hover:shadow-xl"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Test"}
          </Button>
        </div>

        {/* Response JSON Preview */}
        {responseData && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono max-h-80 overflow-y-auto border border-gray-300/30">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Response:
            </p>
            <pre className="whitespace-pre-wrap break-all text-gray-800 dark:text-gray-100">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}