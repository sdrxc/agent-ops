"use client";

import { useState, useContext } from "react";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { AgentDeploymentContext } from "./components/context/AgentDeploymentContext";
import { Bot, Hammer, Server, GitBranch, Lock, Globe, Terminal, Cpu } from "lucide-react";
import { ConfigCard } from "./components/ConfigCard";
import { ReadinessFooter } from "./components/ReadinessFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Drawers
import { ToolsDrawer } from "./components/drawers/ToolsDrawer";
import { ServerDrawer } from "./components/drawers/ServerDrawer";
import { CodeDrawer } from "./components/drawers/CodeDrawer";
import { SecretsDrawer } from "./components/drawers/SecretsDrawer";
import AgentRegistration from "./components/steps/AgentRegistration";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface AgentBuilderProps {
    projectID: string;
}

export function AgentBuilder({ projectID }: AgentBuilderProps) {
    const { state, dispatch } = useContext(AgentDeploymentContext);
    const { user } = useGlobalContext();
    const router = useRouter();

    // Drawers State
    const [activeDrawer, setActiveDrawer] = useState<"identity" | "tools" | "server" | "code" | "secrets" | null>(null);

    // Sequence ID
    const [sequenceID] = useState(() => {
        return `${projectID}-${new Date().toISOString()}-${uuidv4()}`;
    });

    // Derived State for UI
    const toolsCount = state.toolsRegistry?.length || 0;
    const serverName = state.selectedServerID ? "Server Selected" : null;
    const isCodeConnected = state.codeUpload?.connected;
    const secretsCount = state.secretsManager?.length || 0;

    // Validation / Readiness Logic
    const readinessWaitlist: string[] = [];
    if (!state.agentRegistry.name) readinessWaitlist.push("Agent Name");
    if (!state.agentRegistry.version) readinessWaitlist.push("Version");
    if (!state.selectedServerID) readinessWaitlist.push("Server Config");
    if (!isCodeConnected) readinessWaitlist.push("Code Repository");

    const handleDeploy = async () => {
        const userID = user!.userID;
        try {
            const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
            const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
            const isLocalEnv = runtimeEnv === "local";
            const url = isLocalEnv ? `${baseURL}/api/step6-deployAgent` : `/api/step6-deployAgent`;

            const response = await axios.post(url, {
                sequenceID, userID, projectID
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Deployment Initiated Successfully!");
                setTimeout(() => {
                    router.push(`/projects/${projectID}`);
                }, 2000);
            } else {
                toast.error("Deployment signal failed.");
            }
        } catch (error) {
            console.error("Deployment failed:", error);
            toast.error("Deployment Failed");
        }
    };

    // Quick updates for Identity (Name/Desc) directly on dashboard
    const updateIdentity = (field: string, value: string) => {
        const newData = { ...state.agentRegistry, [field]: value };
        dispatch({ type: "SET_AGENT_REGISTRY", payload: newData });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 pb-24">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-md">
                            <Bot className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agent Builder</h1>
                            <p className="text-xs text-gray-500">Project: {projectID}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveDrawer("identity")}>
                            Edit Full Identity
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Grid */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* 1. Identity Card (Main) */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Agent Name</label>
                                    <Input
                                        className="mt-1 text-lg font-semibold"
                                        placeholder="e.g. My Super Agent"
                                        value={state.agentRegistry.name || ""}
                                        onChange={(e) => updateIdentity("name", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <Input
                                        className="mt-1"
                                        placeholder="What does this agent do?"
                                        value={state.agentRegistry.description || ""}
                                        onChange={(e) => updateIdentity("description", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex flex-col justify-center">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Version</span>
                                    <span className="font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded border">{state.agentRegistry.version || "0.0.1"}</span>
                                </div>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveDrawer("identity")}>
                                    Configure Capabilities
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Tools & Integrations */}
                    <ConfigCard
                        title="Tools & Integrations"
                        icon={Hammer}
                        status={toolsCount > 0 ? "ready" : "optional"}
                        onEdit={() => setActiveDrawer("tools")}
                        description="Connect external APIs and services."
                    >
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-bold">{toolsCount}</span>
                            <span className="text-gray-500">tools enabled</span>
                        </div>
                    </ConfigCard>

                    {/* 3. Server Config */}
                    <ConfigCard
                        title="Infrastructure & Compute"
                        icon={Server}
                        status={state.selectedServerID ? "ready" : "missing"}
                        onEdit={() => setActiveDrawer("server")}
                        description="Select target deployment server."
                    >
                        {state.selectedServerID ? (
                            <div className="flex items-center gap-2 mt-2 text-green-600">
                                <CheckCircleIcon className="w-4 h-4" /> Server Selected
                            </div>
                        ) : (
                            <p className="text-sm text-red-500 mt-2">No server selected</p>
                        )}
                    </ConfigCard>

                    {/* 4. Code Repository */}
                    <ConfigCard
                        title="Source Code"
                        icon={GitBranch}
                        status={isCodeConnected ? "ready" : "missing"}
                        onEdit={() => setActiveDrawer("code")}
                        description="Link your git repository."
                    >
                        {isCodeConnected ? (
                            <div className="flex items-center gap-2 mt-2 text-green-600">
                                <CheckCircleIcon className="w-4 h-4" /> Repository Linked
                            </div>
                        ) : (
                            <p className="text-sm text-red-500 mt-2">Not connected</p>
                        )}
                    </ConfigCard>

                    {/* 5. Secrets */}
                    <ConfigCard
                        title="Secrets & Env"
                        icon={Lock}
                        status={secretsCount > 0 ? "ready" : "optional"}
                        onEdit={() => setActiveDrawer("secrets")}
                        description="Manage secure variables."
                    >
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-bold">{secretsCount}</span>
                            <span className="text-gray-500">secrets configured</span>
                        </div>
                    </ConfigCard>

                </div>
            </main>

            {/* Footer */}
            <ReadinessFooter
                readinessWaitlist={readinessWaitlist}
                onDeploy={handleDeploy}
                isDeploying={false} // Todo: Add loading state
            />

            {/* Drawers */}
            <ToolsDrawer
                isOpen={activeDrawer === "tools"}
                onClose={() => setActiveDrawer(null)}
                sequenceID={sequenceID} projectID={projectID} userID={user?.userID || ""}
            />
            <ServerDrawer
                isOpen={activeDrawer === "server"}
                onClose={() => setActiveDrawer(null)}
                sequenceID={sequenceID} projectID={projectID} userID={user?.userID || ""}
            />
            <CodeDrawer
                isOpen={activeDrawer === "code"}
                onClose={() => setActiveDrawer(null)}
                sequenceID={sequenceID} projectID={projectID} userID={user?.userID || ""}
            />
            <SecretsDrawer
                isOpen={activeDrawer === "secrets"}
                onClose={() => setActiveDrawer(null)}
                sequenceID={sequenceID} projectID={projectID} userID={user?.userID || ""}
            />

            {/* Identity Drawer (Reusing AgentRegistration for full details) */}
            <Sheet open={activeDrawer === "identity"} onOpenChange={() => setActiveDrawer(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Agent Identity</SheetTitle>
                        <SheetDescription>Full configuration of agent capabilities and security.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 pb-12">
                        <AgentRegistration
                            sequenceID={sequenceID}
                            projectID={projectID}
                            userID={user?.userID || ""}
                            stepID="101"
                            onStepValidate={() => { }}
                            onNext={() => setActiveDrawer(null)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
}

function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
