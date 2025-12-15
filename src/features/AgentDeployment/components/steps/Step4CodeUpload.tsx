"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Github } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { CodeUpload } from "../../types";

interface Step4CodeUploadProps {
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


const Step4CodeUpload = ({ sequenceID, projectID, userID, stepID, onStepValidate, onNext, onPrevious }: Step4CodeUploadProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [activeTab, setActiveTab] = useState<"github">("github");
  const [repoUrl, setRepoUrl] = useState(state.codeUpload.repoUrl || "");
  const [branch, setBranch] = useState(state.codeUpload.branch || "");
  const [connected, setConnected] = useState(state.codeUpload.connected || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log(`${activeTab} repo URL:`, repoUrl);
    console.log("Branch:", branch);

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
        toast.success("Code Uploaded Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        toast.success("Click on Next to continue", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        setConnected(true);
        dispatch({
          type: "SET_CODE_UPLOAD",
          payload: { repoUrl, branch, connected: true },
        });
        onStepValidate(true);
      } else {
        onStepValidate(false);
      }

    }
    catch (err) {
      console.error("Validation error:", err);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    try {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const isLocalEnv = runtimeEnv === "local";
      const url = isLocalEnv
        ? `${baseURL}/api/step4-validate`
        : `/api/step4-validate`;
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

  // On mount, revalidate existing connection
  useEffect(() => {
    if (state.codeUpload.connected) {
      onStepValidate(true);
    } else {
      onStepValidate(false);
    }
  }, []);

  useEffect(() => {
    handleValidate();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Agent Code Upload</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-1 px-3 py-1 rounded-t-md ${activeTab === "github"
              ? "bg-gray-100 dark:bg-gray-700 font-semibold"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Github className="w-4 h-4" /> GitHub
          </button>
        </div>

        {/* GitHub Tab Content */}
        {activeTab === "github" && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter GitHub repository URL"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setConnected(false);
                dispatch({
                  type: "SET_CODE_UPLOAD",
                  payload: { repoUrl: e.target.value, connected: false },
                });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Enter branch name (default: main)"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setConnected(false);
                dispatch({
                  type: "SET_CODE_UPLOAD",
                  payload: { branch: e.target.value, connected: false }
                });
              }}
              className="border p-2 rounded w-full"
            />
            <Button onClick={handleSubmit} disabled={!repoUrl || !branch}>
              Connect GitHub Repo
            </Button>
            {/* <Button onClick={handleSubmit} disabled={!repoUrl || !branch}>
              {connected ? "Connected" : "Connect GitHub Repo"}
            </Button> */}
            {/* {connected && (
              <div className="p-3 rounded bg-green-50 text-green-700 border border-green-300">
                 Repository connected successfully! You can proceed to the next step.
              </div>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Step4CodeUpload;
