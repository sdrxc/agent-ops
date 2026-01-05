"use client";

import { Button } from "@/components/ui/button";
import { Upload, Github, GitBranch, Link as LinkIcon, AlertCircle, CheckCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { CodeUpload } from "../../types";

interface CodeRepositoryProps {
  sequenceID: string;
  projectID: string;
  userID: string | null | undefined;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";


const CodeRepository = ({ sequenceID, projectID, userID, stepID, onStepValidate, onNext, onPrevious }: CodeRepositoryProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [activeTab, setActiveTab] = useState<"github">("github");

  // Prefill from agentRegistry if available, otherwise use codeUpload state
  const initialRepoUrl = state.agentRegistry.repoUrl || state.codeUpload.repoUrl || "";
  const initialBranch = state.agentRegistry.branch || state.codeUpload.branch || "main";

  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [branch, setBranch] = useState(initialBranch);
  const [connected, setConnected] = useState(state.codeUpload.connected || false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto git scanning states
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Validate GitHub URL format
  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
    return githubRegex.test(url);
  };

  // Auto-check repository access when URL changes
  useEffect(() => {
    const checkRepoAccess = async () => {
      if (!repoUrl || !isValidGitHubUrl(repoUrl)) {
        setIsValidated(false);
        setAvailableBranches([]);
        return;
      }

      setIsCheckingAccess(true);

      // Simulate API call to check access and fetch branches
      // In production, this would call your backend which uses GitHub API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful validation with branches
      setIsValidated(true);
      setAvailableBranches(['main', 'develop', 'staging', 'production']);
      setIsCheckingAccess(false);
    };

    // Debounce the check
    const timer = setTimeout(() => {
      checkRepoAccess();
    }, 800);

    return () => clearTimeout(timer);
  }, [repoUrl]);

  // Auto-trigger scan when branch is selected
  useEffect(() => {
    const triggerScan = async () => {
      if (!isValidated || !branch || branch === initialBranch) return;

      setIsScanning(true);

      // Simulate repository scanning (extracting metadata, dependencies, etc.)
      await new Promise(resolve => setTimeout(resolve, 2500));

      setIsScanning(false);
      toast.success("Repository scanned successfully!", {
        style: { background: "#dcfce7", color: "#166534" }
      });
    };

    const timer = setTimeout(() => {
      triggerScan();
    }, 500);

    return () => clearTimeout(timer);
  }, [branch, isValidated]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const endpoint = isLocalEnv ? `${baseURL}/api/step4-codeUpload` : `/api/step4-codeUpload`;
      const response = await axios.post(endpoint, {
        projectID,
        sequenceID,
        userID,
        repoUrl,
        branch
      });

      if (response.status == 200 || response.status == 201) {
        toast.success("Repository connected successfully!", { style: { background: "#dcfce7", color: "#166534" } });

        setConnected(true);
        dispatch({
          type: "SET_CODE_UPLOAD",
          payload: { repoUrl, branch, connected: true },
        });
        onStepValidate(true);
        onNext(); // Advance
      } else {
        onStepValidate(false);
        toast.error("Failed to connect repository.");
      }

    }
    catch (err) {
      console.error("Validation error:", err);
      toast.error("Failed to connect repository.");
    } finally {
      setSubmitting(false);
    }
  };


  // On mount, revalidate existing connection
  useEffect(() => {
    const checkValidation = async () => {
      const url = isLocalEnv ? `${baseURL}/api/step4-validate` : `/api/step4-validate`;
      try {
        const res = await axios.post(url, { projectID, sequenceID, userID, stepID });
        if (res?.data?.data?.valid === true) {
          onStepValidate(true);
          setConnected(true);
        } else {
          onStepValidate(false);
        }
      } catch (e) { /* ignore */ }
    }

    // Check if we already have it in state, otherwise check API
    if (state.codeUpload.connected) {
      onStepValidate(true);
      setConnected(true);
    } else {
      checkValidation();
    }
  }, []);


  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Github className="w-6 h-6 text-blue-600" /> Code Repository
          </h2>
          <p className="text-gray-500 mt-1">Connect your agent&apos;s source code repository.</p>
        </div>
        {connected && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Connected
          </span>
        )}
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Header for Tabs - keeping it simple for now since only Github is active */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-4">
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'github' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Github className="w-4 h-4" /> GitHub Project
            </button>
            {/* Placeholder for future providers */}
            <button disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed">
              <Upload className="w-4 h-4" /> Direct Upload (Soon)
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Repository URL with Auto-Validation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repository URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    setConnected(false);
                    setIsValidated(false);
                    onStepValidate(false);
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 outline-none transition-all
                    ${isValidated
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                    }`}
                />
                {/* Loading Indicator */}
                {isCheckingAccess && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                )}
                {/* Checkmark */}
                {!isCheckingAccess && isValidated && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {isCheckingAccess ? "Checking access..." : "Public or private GitHub repository URL"}
              </p>
            </div>

            {/* Branch Selector - Dynamic Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setConnected(false);
                    onStepValidate(false);
                  }}
                  disabled={!isValidated || isCheckingAccess}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="" disabled>
                    {isCheckingAccess ? "Fetching branches..." : (!isValidated ? "Enter URL first..." : "Select a branch...")}
                  </option>
                  {availableBranches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {/* Custom Dropdown Arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400">Select branch to trigger auto-scan</p>
            </div>
          </div>

          {/* Scanning Notification */}
          {isScanning && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0" />
              <p className="font-medium">Scanning repository and extracting metadata...</p>
            </div>
          )}

          {/* Connection Status Info Block */}
          {!connected && repoUrl && branch && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ready to connect</p>
                <p className="opacity-90">Click the button below to verify repository access and link it to this agent.</p>
              </div>
            </div>
          )}

          {connected && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-lg text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Successfully Connected</p>
                <p className="opacity-90">Repository at <strong>{repoUrl}</strong> ({branch}) is linked.</p>
              </div>
            </div>
          )}


          <div className="flex justify-end pt-2">
            <Button
              variant="default"
              size="xl"
              onClick={handleSubmit}
              disabled={!repoUrl || !branch || submitting}
            >
              {submitting ? "Connecting..." : connected ? "Update Connection" : "Connect Repository"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRepository;
