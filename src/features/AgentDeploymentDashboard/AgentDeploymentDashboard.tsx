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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  SortAsc,
  Search,
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

  const resetRegisterForm = useCallback(() => {
    setShowRegisterForm(false);
    setAgentName("");
    setAgentDescription("");
    setAgentTags("");
    setSubmitting(false);
  }, []);

  const handleDeployAgent = () => {
    if (!projectID) return;
    router.push(`/projectAgentDeployment/${encodeURIComponent(projectID)}`);
  };

  const handleShowRegisterForm = () => {
    setShowRegisterForm(true);
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
        resetRegisterForm();
        fetchAgents();
      }
    } catch {
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
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-6">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-violet-600 dark:text-violet-400 text-2xl">
              <Bot className="w-6 h-6" />
              Agent Dashboard
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Monitor and manage your AI agents from a single dashboard.
            </p>
          </div>

          {/* Controls */}
          <div className="flex sm:flex-row flex-col sm:flex-wrap gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[230px]">
              <input
                type="text"
                placeholder="Search agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-gray-800 py-2 pr-4 pl-10 border border-gray-200 focus:border-violet-500 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full text-sm"
              />
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2" />
            </div>

            {/* Sort field */}
            <Select
              value={sortConfig.field}
              onValueChange={(value) =>
                setSortConfig((p) => ({ field: value, direction: p.direction }))
              }
            >
              <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm">
                <SortAsc className="mr-2 w-4 h-4" />
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
              className="flex items-center gap-2 w-full sm:w-auto text-sm"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Add Agent Options */}
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            Add New Agent
          </h3>
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
            {/* Deploy Agent Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={handleDeployAgent}
              className="group flex flex-col justify-center items-center gap-4 bg-linear-to-b from-white dark:from-zinc-900 to-violet-50 dark:to-violet-950 hover:shadow-lg p-8 border border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-500 rounded-2xl text-center transition-all cursor-pointer"
            >
              <div className="bg-violet-100 dark:bg-violet-900/30 dark:group-hover:bg-violet-800 group-hover:bg-violet-200 p-3 rounded-full transition-all">
                <Rocket className="w-10 h-10 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Deploy an Agent
              </p>
              <p className="max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Configure a new deployment for your agent.
              </p>
            </motion.div>

            {/* Register Agent Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={handleShowRegisterForm}
              className="group flex flex-col justify-center items-center gap-4 bg-linear-to-b from-white dark:from-zinc-900 to-violet-50 dark:to-violet-950 hover:shadow-lg p-8 border border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-500 rounded-2xl text-center transition-all cursor-pointer"
            >
              <div className="bg-violet-100 dark:bg-violet-900/30 dark:group-hover:bg-violet-800 group-hover:bg-violet-200 p-3 rounded-full transition-all">
                <UserPlus className="w-10 h-10 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Register an Agent
              </p>
              <p className="max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Register an existing or external agent.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Register Agent Form */}
        {showRegisterForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 shadow-lg p-8 border border-violet-200 dark:border-violet-800 rounded-2xl"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-violet-600 dark:text-violet-400 text-2xl">
                    Register a New Agent
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Fill in the details to register your new agent.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetRegisterForm}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400"
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Agent Name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="border-violet-200 focus:border-violet-500 dark:border-violet-800 focus:ring-violet-500"
                />
                <Textarea
                  placeholder="Agent Description"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  rows={3}
                  className="border-violet-200 focus:border-violet-500 dark:border-violet-800 focus:ring-violet-500"
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={agentTags}
                  onChange={(e) => setAgentTags(e.target.value)}
                  className="border-violet-200 focus:border-violet-500 dark:border-violet-800 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={resetRegisterForm}
                  className="hover:bg-violet-50 dark:hover:bg-violet-950 border-violet-300 dark:border-violet-800 text-violet-600 dark:text-violet-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegisterAgent}
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-700 shadow-md text-white"
                >
                  {submitting ? "Registering..." : "Register Agent"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Agents Grid */}
        {loadingAgents ? (
          <div className="py-12 text-gray-500 dark:text-gray-400 text-center">
            Loading agents...
          </div>
        ) : filteredAndSortedAgents.length > 0 ? (
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-gray-500 dark:text-gray-400 text-center">
            No agents available. Add and configure agents to see them here.
          </div>
        )}
      </div>
    </>
  );
}

export { AgentDeploymentDashboard };
export type { AgentDashhboardProps };
