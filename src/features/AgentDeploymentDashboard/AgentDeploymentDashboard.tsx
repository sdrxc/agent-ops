"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AgentCard } from "@/components/cards/AgentCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  SortAsc,
  Search,
  Plus,
  Bot,
  RefreshCcw,
  Rocket,
  UserPlus,
} from "lucide-react";
import { Agent } from "@/types/api";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import axios from "axios";
import toast from "react-hot-toast";

interface AgentDashhboardProps {
  projectID: string;
}

function AgentDeploymentDashboard({ projectID }: AgentDashhboardProps) {
  const { user, loading } = useGlobalContext();
  const [agentsData, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc" as "asc" | "desc",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentTags, setAgentTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const fetchAgents = useCallback(async () => {
    if (loading || !user?.userID || !projectID) return;

    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const isLocalEnv = runtimeEnv === "local";
    const url = isLocalEnv
      ? `${baseURL}/api/listProjectAgents`
      : `/api/listProjectAgents`;

    try {
      setLoadingAgents(true);
      const res = await axios.post(url, {
        userID: user.userID,
        projectID,
      });
      if (res.status === 200 || res.status === 201) {
        setAgents(Array.isArray(res.data?.data?.agents) ? res.data.data.agents : []);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch agents:", error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
      setIsRefreshing(false);
    }
  }, [loading, user?.userID, projectID]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agentsData];
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(s));
    }

    const m = sortConfig.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sortConfig.field) {
        case "name":
          return m * a.name.localeCompare(b.name);
        case "performance":
          return m * ((b.performance?.successRate || 0) - (a.performance?.successRate || 0));
        case "cost":
          return m * ((a.sessions?.costPerSession || 0) - (b.sessions?.costPerSession || 0));
        default:
          return 0;
      }
    });
  }, [searchQuery, sortConfig, agentsData]);

  const resetDialogState = useCallback(() => {
    setShowRegisterForm(false);
    setAgentName("");
    setAgentDescription("");
    setAgentTags("");
    setSubmitting(false);
  }, []);

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    if (!isOpen) resetDialogState();
  };

  const handleAddAgent = () => {
    resetDialogState();
    setOpenDialog(true);
  };

  const handleDeployAgent = () => {
    setOpenDialog(false);
    if (!projectID) return;
    router.push(`/projectAgentDeployment/${encodeURIComponent(projectID)}`);
  };

  const handleRegisterAgent = async () => {
    if (!agentName.trim()) {
      alert("Please enter an agent name.");
      return;
    }

    setSubmitting(true);
    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const isLocalEnv = runtimeEnv === "local";
    const url = isLocalEnv
      ? `${baseURL}/api/registerNewAgent`
      : `/api/registerNewAgent`;

    try {
      const res = await axios.post(url, {
        userID: user?.userID,
        projectID,
        name: agentName,
        description: agentDescription,
        tags: agentTags.split(",").map((t) => t.trim()),
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Agent registered successfully!");
        resetDialogState();
        setOpenDialog(false);
        fetchAgents();
      }
    } catch (error) {
      toast.error("❌ Failed to register agent.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAgents();
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-violet-600 dark:text-violet-400">
              <Bot className="w-6 h-6" />
              Agent Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Monitor and manage your AI agents from a single dashboard.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[230px]">
              <input
                type="text"
                placeholder="Search agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white dark:bg-gray-800"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Sort field */}
            <Select
              value={sortConfig.field}
              onValueChange={(value) =>
                setSortConfig((p) => ({ field: value, direction: p.direction }))
              }
            >
              <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort direction */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortConfig((p) => ({
                  ...p,
                  direction: p.direction === "asc" ? "desc" : "asc",
                }))
              }
              className="w-full sm:w-auto"
            >
              {sortConfig.direction === "asc" ? "↑ Asc" : "↓ Desc"}
            </Button>

            {/* Refresh */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-sm w-full sm:w-auto"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Add Agent */}
        <div
          onClick={handleAddAgent}
          className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 transition hover:border-violet-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        >
          <div className="p-3 bg-white dark:bg-gray-900 rounded-full text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all">
            <Plus className="h-6 w-6" />
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Add a new agent
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Deploy or register an agent to your project.
            </p>
          </div>
        </div>

        {/* Agents Grid */}
        {loadingAgents ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            Loading agents...
          </div>
        ) : filteredAndSortedAgents.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No agents available. Add and configure agents to see them here.
          </div>
        )}
      </div>

      {/* Dialog Section (unchanged) */}
      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl border border-violet-100 dark:border-violet-900 p-8 sm:p-10 bg-white dark:bg-zinc-950 transition-all">
          {!showRegisterForm ? (
            <>
              <DialogHeader className="text-center space-y-3">
                <DialogTitle className="text-3xl font-semibold text-violet-600 dark:text-violet-400 tracking-tight">
                  Add an Agent
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 text-base">
                  Choose how you’d like to get started with agents.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  onClick={handleDeployAgent}
                  className="group cursor-pointer bg-gradient-to-b from-white to-violet-50 dark:from-zinc-900 dark:to-violet-950 border border-violet-200 dark:border-violet-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all hover:shadow-lg hover:scale-[1.03] hover:border-violet-400 dark:hover:border-violet-500"
                >
                  <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-all">
                    <Rocket className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    Deploy an Agent
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                    Configure a new deployment for your agent.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setShowRegisterForm(true)}
                  className="group cursor-pointer bg-gradient-to-b from-white to-violet-50 dark:from-zinc-900 dark:to-violet-950 border border-violet-200 dark:border-violet-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all hover:shadow-lg hover:scale-[1.03] hover:border-violet-400 dark:hover:border-violet-500"
                >
                  <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-all">
                    <UserPlus className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    Register an Agent
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                    Register an existing or external agent.
                  </p>
                </motion.div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="text-center space-y-3 mb-6">
                <DialogTitle className="text-2xl font-semibold text-violet-600 dark:text-violet-400">
                  Register a New Agent
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Fill in the details to register your new agent.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Agent Name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="border-violet-200 dark:border-violet-800 focus:ring-violet-500 focus:border-violet-500"
                />
                <Textarea
                  placeholder="Agent Description"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  rows={3}
                  className="border-violet-200 dark:border-violet-800 focus:ring-violet-500 focus:border-violet-500"
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={agentTags}
                  onChange={(e) => setAgentTags(e.target.value)}
                  className="border-violet-200 dark:border-violet-800 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowRegisterForm(false)}
                  className="border-violet-300 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950"
                >
                  Back
                </Button>
                <Button
                  onClick={handleRegisterAgent}
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                >
                  {submitting ? "Registering..." : "Register Agent"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { AgentDeploymentDashboard };
export type { AgentDashhboardProps };
