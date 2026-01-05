import { CheckCircle2, Circle, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { AgentDeploymentContext } from "./context/AgentDeploymentContext";

export interface StepItem {
  id: string; // "1", "2" or unique ID
  title: string;
  description?: string;
  isCompleted: boolean;
  isLocked: boolean;
  isOptional?: boolean;
  hasError?: boolean;
}

interface DeploymentSidebarProps {
  steps: StepItem[];
  activeStepId: string;
  onStepClick: (stepId: string) => void;
  // onDeploy and isDeploying removed as they are now in the final step
  onDeploy?: () => void;
  isDeploying?: boolean;
  className?: string; // Standardize generic props
}

export function DeploymentSidebar({
  steps,
  activeStepId,
  onStepClick,
  onDeploy,
  isDeploying = false,
  className,
}: DeploymentSidebarProps) {
  const { state } = useContext(AgentDeploymentContext);

  // Compute readiness checks (only for visual cues if needed, currently unused in render)
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
    <aside className={cn("h-full flex flex-col gap-4 p-4", className)}>
      <div className="mb-4 shrink-0">
        <h2 className="text-lg font-semibold text-foreground">
          Deployment Checklist
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete these steps to launch your agent.
        </p>
      </div>

      <nav className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
        {steps.map((step) => {
          const isActive = activeStepId === step.id;

          return (
            <button
              key={step.id}
              onClick={() => !step.isLocked && onStepClick(step.id)}
              disabled={step.isLocked}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg text-left transition-colors border",
                // Active State
                isActive
                  ? "bg-background border-primary shadow-sm ring-1 ring-primary/20"
                  : "hover:bg-muted border-transparent",
                // Locked State
                step.isLocked &&
                  "opacity-50 cursor-not-allowed hover:bg-transparent",
                // Completed State (visual nuance)
                step.isCompleted &&
                  !isActive &&
                  "bg-success/10 border-success/20",
                // Error State overrides others if not active or completed
                step.hasError &&
                  !step.isCompleted &&
                  !isActive &&
                  "bg-destructive/10 border-destructive/20"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {step.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : step.isLocked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : step.hasError ? (
                  <AlertCircle className="w-5 h-5 text-warning" />
                ) : (
                  <Circle
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center w-full">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : "text-foreground",
                      step.isCompleted && !isActive && "text-success",
                      step.hasError && !step.isCompleted && "text-warning"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.isOptional && !step.isCompleted && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  )}
                </div>
                {step.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {step.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4 shrink-0">
        {!canDeploy && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Setup Incomplete</span>
            </div>
            <div className="space-y-1">
              {missingChecks.map((check) => (
                <div
                  key={check.id}
                  className="text-xs text-warning/80 flex items-center gap-1.5"
                >
                  <div className="w-1 h-1 rounded-full bg-warning" />
                  {check.error}
                </div>
              ))}
            </div>
          </div>
        )}

        {canDeploy && (
          <div className="flex items-center gap-2 text-success mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Ready to Deploy</span>
          </div>
        )}

        {onDeploy && (
          <button
            onClick={onDeploy}
            disabled={!canDeploy || isDeploying}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors shadow-md",
              !canDeploy || isDeploying
                ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            {isDeploying ? <>Deploying...</> : <>Deploy Agent</>}
          </button>
        )}
      </div>
    </aside>
  );
}
