"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Agent } from "@/types/api";

import { AgentCard } from "@/components/cards/AgentCard";
import { AgentDetailModal } from "@/components/AgentDetailModal";
import { useGlobalContext } from "@/app/GlobalContextProvider";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SortAsc } from "lucide-react";
import {
  PageHeader,
  PageToolbar,
  ContentGrid,
} from "@/components/page-sections";

interface AgentHubProps { }

interface SortConfig {
  field: "name" | "performance" | "cost";
  direction: "asc" | "desc";
}

export function AgentHub({ }: AgentHubProps) {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ───────────────────────────────────────────────
  // Fetch Catalogue Agents with Fault-Tolerance
  // ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);

        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";

        const listCatalogueURL = isLocalEnv
          ? `${baseURL}/api/listCatalogueAgents`
          : `/api/listCatalogueAgents`;

        const result = await axios.post(listCatalogueURL, {
          userID: user?.userID, // if you have user context, replace here
        });

        let returnedAgents: Agent[] = Array.isArray(result.data)
          ? result.data
          : result.data?.data?.agents || [];

        setAgents(returnedAgents || []);
      } catch (err) {
        console.error("Error loading catalogue agents:", err);
        setAgents([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // ───────────────────────────────────────────────
  // Filter + Sort logic
  // ───────────────────────────────────────────────
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((agent) =>
        agent.name?.toLowerCase().includes(query)
      );
    }

    const multiplier = sortConfig.direction === "asc" ? 1 : -1;

    return filtered.sort((a, b) => {
      switch (sortConfig.field) {
        case "name":
          return multiplier * a.name.localeCompare(b.name);

        case "performance":
          return multiplier *
            ((b.performance?.successRate || 0) -
              (a.performance?.successRate || 0));

        case "cost":
          return multiplier *
            ((a.sessions?.costPerSession || 0) -
              (b.sessions?.costPerSession || 0));

        default:
          return 0;
      }
    });
  }, [agents, searchQuery, sortConfig]);

  // ───────────────────────────────────────────────
  // Action handlers
  // ───────────────────────────────────────────────
  const handleTestAgent = (agent: Agent) => {
    router.push(`/playground?agent=${agent.id}`);
  };



  const handleStartAgent = (agentId: string) => alert(`Starting agent ${agentId}...`);
  const handleStopAgent = (agentId: string) => alert(`Stopping agent ${agentId}...`);

  const handleCardClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Agent Catalogue"
          description="Your one-stop destination for all your agents."
        />

        <PageToolbar
          searchPlaceholder="Search agent by name..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={
            <>
              <Select
                value={sortConfig.field}
                onValueChange={(value) =>
                  setSortConfig((prev) => ({
                    field: value as SortConfig["field"],
                    direction: prev.direction,
                  }))
                }
              >
                <SelectTrigger className="w-full md:w-[140px] h-9">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortConfig((prev) => ({
                    ...prev,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                  }))
                }
              >
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </Button>
            </>
          }
        />

        <ContentGrid
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          loading={loading}
          empty={!loading && filteredAndSortedAgents.length === 0}
        >
          {filteredAndSortedAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
            />
          ))}
        </ContentGrid>
      </div>

      {/* Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedAgent(null);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
