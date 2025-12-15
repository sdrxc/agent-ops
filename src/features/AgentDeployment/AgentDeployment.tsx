"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, XCircle, Info, Github, Code2Icon, CodeIcon, CodeSquareIcon, Wrench } from "lucide-react";
import {
  Rocket,
  Bot,
  Settings,
  Play,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  User,
  Code,
  Server,
  TestTube,
  Upload,
  Plus,
  X,
  AlertCircle,
  Check,
  Globe,
  Database,
  Shield,
  Zap,
} from "lucide-react";
import Step1BasicConfig from "./components/steps/Step1AgentRegistry";
import Step2ToolsRegistry from "./components/steps/Step2ToolsRegistry";
import Step3ServerRegisrtry from "./components/steps/Step3ServerRegisrtry";
import Step4CodeUpload from "./components/steps/Step4CodeUpload";
import Step5CICDConfig from "./components/steps/Step5SecretsManangement";
import Step6DeployAgent from "./components/steps/Step6DeployAgent";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import { useGlobalContext } from "@/app/GlobalContextProvider";
import axios from "axios";
import toast from "react-hot-toast";
import React, { useContext } from 'react';
import { AgentDeploymentContext } from "./components/context/AgentDeploymentContext";

const deploymentSteps = [
  {
    id: 1,
    title: "Agent Registry",
    description: "Register your agent",
    icon: Bot,
  },
  {
    id: 2,
    title: "Tools & Integrations",
    description: "Select and configure the tools your agent will use",
    icon: Wrench,
  },
  {
    id: 3,
    title: "Server Configuration",
    description: "Configure server settings",
    icon: Server,
  },
  {
    id: 4,
    title: "Code Upload",
    description: "Upload the codebase of your agent",
    icon: CodeIcon,
  },
  {
    id: 5,
    title: "Secret Manager",
    description: "Configure Secrets",
    icon: CodeSquareIcon,
  },
  {
    id: 6,
    title: "Deploy Agent",
    description: "Final deployment and monitoring setup",
    icon: Rocket,
  },
];



interface AgentDeploymentProps {
  projectID: string; // Add the projectId prop here
}

export const AgentDeployment = ({ projectID }: AgentDeploymentProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  // const user = {
  //   "userId": "bayer-user-01",
  //   "userName": "Bayer User",
  //   "userEmail": "testuser@bayer.com",
  //   "userRole": "admin",
  //   "sessionId": "sesssion-id-0070-24242-4234",
  //   "orgId": "bayer-01",
  //   "accessDetails": {
  //   }
  // }

  const { user, loading, refreshUser } = useGlobalContext();
  console.log("userin agentdeploy", user);
  const [stepValid, setStepValid] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const progress = (state.currentStep / deploymentSteps.length) * 100;

  const [sequenceID] = useState(() => {
    const now = new Date().toISOString(); // compact datetime
    const unique = uuidv4();
    return `${projectID}-${now}-${unique}`;
  });

  const goNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const goPrevious = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const router = useRouter();

  const handleDeploy = async (projectID: string, sequenceID: string) => {
    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const isLocalEnv = runtimeEnv === "local";

    const userID = user!.userID
    setIsDeploying(true);
    try {
      const url = isLocalEnv ? `${baseURL}/api/step6-deployAgent` : `/api/step6-deployAgent`;
      const response = await axios.post(url, {
        sequenceID, userID, projectID
      });

      if (response.status == 200 || response.status == 201) {
        toast.success("Agent Deployment in Progress", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        console.log(projectID);

        const encodedProjectId = projectID ? projectID : "prj-001";

        // Delay redirect by 2 seconds
        setTimeout(() => {
          router.push(`/projects/${encodedProjectId}`);
          console.log("inside project");
          setIsDeploying(false);
        }, 100);
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      setIsDeploying(false);
    }

  };

  const getStepStatus = (stepId: number) => {
    if (stepId < state.currentStep) return "completed";
    if (stepId === state.currentStep) return "current";
    return "pending";
  };

  // Wait until user is loaded
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading user details...
      </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        {/* Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Deployment Progress</CardTitle>
              <Badge variant="secondary">
                Step {state.currentStep} of {deploymentSteps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
        </Card>
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {deploymentSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center space-y-2 flex-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${status === "completed"
                    ? "bg-green-500 text-white"
                    : status === "current"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {status === "completed" ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="text-center">
                  <h4
                    className={`text-sm font-medium ${status === "current" ? "text-primary" : "text-gray-600"}`}
                  >
                    {step.title}
                  </h4>
                </div>
                {index < deploymentSteps.length - 1 && (
                  <div className="hidden md:block absolute w-full h-0.5 bg-gray-200 top-6 left-1/2 transform translate-x-1/2 -z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step components */}
        { state.currentStep === 1 && 
          <Step1BasicConfig 
            sequenceID={sequenceID} 
            projectID={projectID} 
            userID={user!.userID} 
            onNext={goNext} 
            onStepValidate={(isValid: boolean) => setStepValid(isValid)}
            stepID="101"
          />
        }
        { state.currentStep === 2 && 
          <Step2ToolsRegistry sequenceID={sequenceID}
            projectID={projectID}
            userID={user!.userID}
            onStepValidate={(isValid: boolean) => setStepValid(isValid)} 
            onNext={goNext} 
            onPrevious={goPrevious}
            stepID="102"
          />
        }
        { state.currentStep === 3 && 
          <Step3ServerRegisrtry sequenceID={sequenceID}
            projectID={projectID}
            userID={user!.userID}
            onStepValidate={(isValid: boolean) => setStepValid(isValid)} 
            onNext={goNext} 
            onPrevious={goPrevious}
            stepID="103"
          />
        }
        { state.currentStep === 4 && 
          <Step4CodeUpload sequenceID={sequenceID}
            projectID={projectID}
            userID={user!.userID}
            onStepValidate={(isValid: boolean) => setStepValid(isValid)} 
            onNext={goNext} 
            onPrevious={goPrevious}
            stepID="104"
          />
        }
        { state.currentStep === 5 && 
          <Step5CICDConfig sequenceID={sequenceID}
            projectID={projectID}
            userID={user!.userID}
            onStepValidate={(isValid: boolean) => setStepValid(isValid)} 
            onNext={goNext} 
            onPrevious={goPrevious}
            stepID="105"
          />
        }
        { state.currentStep === 6 && 
          <Step6DeployAgent sequenceID={sequenceID}
            projectID={projectID}
            userID={user!.userID}
            onStepValidate={(isValid: boolean) => setStepValid(isValid)} 
            onNext={goNext} 
            onPrevious={goPrevious}
            stepID="106"
          />
        }
        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={state.currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {state.currentStep === deploymentSteps.length ? (
            <Button
              onClick={() => handleDeploy(projectID, sequenceID)}
              disabled={isDeploying}
              className="flex items-center space-x-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  <span>Deploy Agent</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!stepValid}
              className="flex items-center space-x-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
  );
}
