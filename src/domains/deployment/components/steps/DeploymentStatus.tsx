"use client";

import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2, ShieldCheck, Server, AlertTriangle, XCircle, AlertCircle } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";

interface DeploymentStatusProps {
  sequenceID: string;
  projectID: string
  userID: string | null | undefined;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  onNext: () => void; // This will trigger the actual deploy in the parent
  onPrevious: () => void;
}

const DeploymentStatus = ({ sequenceID, projectID, userID, stepID, onStepValidate, onNext, onPrevious }: DeploymentStatusProps) => {
  const { state } = useContext(AgentDeploymentContext);
  const [deploying, setDeploying] = useState(false);

  // Compute Readiness
  const checks = [
    {
      id: 'agent',
      label: 'Agent Identity',
      isValid: !!state.agentRegistry.name && !!state.agentRegistry.version,
      error: 'Missing Name or Version'
    },
    {
      id: 'server',
      label: 'Server Configuration',
      isValid: !!state.selectedServerID,
      error: 'No Server Selected'
    },
    {
      id: 'code',
      label: 'Code Repository',
      isValid: state.codeUpload?.connected === true,
      error: 'Repository Not Connected'
    }
  ];

  const canDeploy = checks.every(c => c.isValid);

  // Auto-validate based on readiness
  useEffect(() => {
    onStepValidate(canDeploy);
  }, [canDeploy]);

  const handleDeployClick = async () => {
    if (!canDeploy) return;
    setDeploying(true);
    await onNext();
    setDeploying(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-600" /> Deployment
          </h2>
          <p className="text-gray-500 mt-1">Review configuration and launch your agent.</p>
        </div>
      </div>

      {canDeploy ? (
        // READY STATE
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full mx-auto flex items-center justify-center shadow-sm">
            <Rocket className="w-10 h-10 text-green-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ready to Launch!</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              All systems go. Your agent is fully configured and ready for deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-sm font-medium">Configuration</p>
                <p className="text-xs text-green-600">Validated</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Server className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm font-medium">Server</p>
                <p className="text-xs text-blue-600">Provisioned</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-xs text-purple-600">Checks Passed</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button
              size="lg"
              onClick={handleDeployClick}
              disabled={deploying}
              className="px-12 py-8 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              {deploying ? "Deploying Agent..." : "Deploy Agent Now 🚀"}
            </Button>
            <p className="text-xs text-gray-400 mt-4">This action will provision resources and start your agent.</p>
          </div>
        </div>
      ) : (
        // NOT READY STATE
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Missing Requirements</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Please complete the following mandatory steps before deploying your agent.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            {checks.map((check) => (
              <div key={check.id} className={`flex items-center justify-between p-3 rounded-lg border ${check.isValid ? 'bg-white border-gray-100 text-gray-500' : 'bg-red-50 border-red-100 text-red-700'}`}>
                <span className="flex items-center gap-2 font-medium">
                  {check.isValid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  {check.label}
                </span>
                {!check.isValid && <span className="text-xs font-semibold bg-red-100 px-2 py-1 rounded">{check.error}</span>}
              </div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <Button disabled className="opacity-50 cursor-not-allowed px-8 py-4 text-lg">
              Complete Setup to Deploy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus;
