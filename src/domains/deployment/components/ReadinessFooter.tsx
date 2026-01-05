import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatus {
    isConnected: boolean;
    label: string;
}

interface ReadinessFooterProps {
    readinessWaitlist: string[]; // List of missing items e.g., ["Select Server", "Add Agent Name"]
    onDeploy: () => void;
    isDeploying: boolean;
}

export function ReadinessFooter({ readinessWaitlist, onDeploy, isDeploying }: ReadinessFooterProps) {
    const totalSteps = 4; // Identity, Tools, Server, Code (Secrets optional)
    // Simplified readiness logic for demo:
    // We assume readinessWaitlist contains only MISSING mandatory items.
    // If list is empty, we are 100% ready.

    const missingCount = readinessWaitlist.length;
    // This is a naive calculation just for visual feedback
    const progress = Math.max(0, Math.min(100, ((totalSteps - missingCount) / totalSteps) * 100));
    const isReady = missingCount === 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-xl z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Readiness Status */}
                <div className="flex-1 w-full md:w-auto">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                            {isReady ? (
                                <span className="text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ready to Deploy</span>
                            ) : (
                                <span className="text-amber-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Setup Incomplete</span>
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className={cn("h-2", isReady ? "bg-green-100" : "bg-gray-100")} />

                    {!isReady && (
                        <div className="mt-2 text-xs text-red-500 flex flex-wrap gap-2">
                            <span className="font-semibold text-gray-500">Missing:</span>
                            {readinessWaitlist.map((item, idx) => (
                                <span key={idx} className="bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/50">
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {/* Can add "Save Draft" here later */}
                    <Button
                        size="lg"
                        onClick={onDeploy}
                        disabled={!isReady || isDeploying}
                        className={cn(
                            "gap-2 font-semibold transition-all shadow-lg hover:shadow-xl",
                            isReady ? "bg-green-600 hover:bg-green-700 hover:scale-105" : "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isDeploying ? "Deploying..." : (
                            <>
                                <Rocket className="w-4 h-4" /> Deploy Agent
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
