"use client";

import { useContext } from "react";
import { CheckCircle2, AlertCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { cn } from "@/lib/utils";

interface ReviewAndDeployProps {
  onDeploy: () => void;
  isDeploying: boolean;
}

export function ReviewAndDeploy({ onDeploy, isDeploying }: ReviewAndDeployProps) {
  const { state } = useContext(AgentDeploymentContext);

  // Compute readiness checks (same logic as DeploymentSidebar)
  const checks = [
    {
      id: "agent",
      label: "Agent Identity",
      isValid: !!state.agentRegistry.name && !!state.agentRegistry.version,
      error: "Missing Name or Version",
    },
    {
      id: "server",
      label: "Server Configuration",
      isValid: !!state.selectedServerID,
      error: "No Server Selected",
    },
    {
      id: "code",
      label: "Code Repository",
      isValid:
        !!(state.agentRegistry.repoUrl && state.agentRegistry.branch) ||
        state.codeUpload?.connected === true,
      error: "Repository Not Connected",
    },
  ];

  const canDeploy = checks.every((c) => c.isValid);
  const missingChecks = checks.filter((c) => !c.isValid);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-600" /> Review & Deploy
          </h2>
          <p className="text-muted-foreground mt-1">
            Review your configuration and launch your agent.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4 text-foreground">
          Ready to Launch?
        </h3>

        {canDeploy ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg flex gap-3 items-center border border-green-100 dark:border-green-900/30">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-medium">
                All systems go. Your agent is ready for deployment.
              </span>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="default"
                size="xl" 
                onClick={onDeploy} 
                disabled={isDeploying}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                {isDeploying ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                     Deploying Agent...
                   </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" /> Deploy Agent Now
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 rounded-lg border border-amber-100 dark:border-amber-900/30 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium block mb-1">Deployment Checklist Incomplete</span>
                <span className="text-sm opacity-90">Please complete the following requirements before deploying:</span>
              </div>
            </div>
            
            <ul className="space-y-2 pl-1">
              {missingChecks.map((check) => (
                <li key={check.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                   {check.error}
                </li>
              ))}
            </ul>

            <Button disabled size="xl" className="w-full opacity-50 cursor-not-allowed">
              Complete Setup to Deploy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

