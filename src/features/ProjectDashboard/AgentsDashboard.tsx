"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgentCard } from "@/components/cards/AgentCard";
import { AgentDetailModal } from "@/components/AgentDetailModal";
import { Layout } from "@/components/Layout";
import { KPIDashboard } from "@/components/KPIDashboard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, SortAsc, Search } from "lucide-react";
import { Agent, DashboardMetrics } from "@/types/api";

// Static dummy data - no API calls
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Customer Support Bot",
    description:
      "Intelligent customer service assistant that handles common inquiries and escalates complex issues to human agents.",
    status: "active",
    version: "v2.1.3",
    model: "GPT-4",
    lastActivity: "2 minutes ago",
    performance: {
      successRate: 94.5,
      responseTime: 150,
      uptime: 99.8,
      errorRate: 2.1,
    },
    sessions: {
      total: 15420,
      costPerSession: 0.045,
    },
    tokens: {
      input: 1250000,
      output: 890000,
      total: 2140000,
    },
    tags: ["Customer Service", "NLP", "Support"],
    agentAPI: "http://k8s-project1-project1-1d8c4ed009-587900353.us-east-1.elb.amazonaws.com/agent-10052/",
    agentdeploymenttype: "deployed"
  },
  {
    id: "2",
    name: "Content Generator",
    description:
      "Creative AI that generates high-quality marketing content, blog posts, and social media content.",
    status: "active",
    version: "v1.8.2",
    model: "GPT-4",
    lastActivity: "5 minutes ago",
    performance: {
      successRate: 91.2,
      responseTime: 200,
      uptime: 99.9,
      errorRate: 3.4,
    },
    sessions: {
      total: 8750,
      costPerSession: 0.067,
    },
    tokens: {
      input: 980000,
      output: 1340000,
      total: 2320000,
    },
    tags: ["Content", "Marketing", "Creative"],
    agentAPI: "http://k8s-project1-project1-1d8c4ed009-587900353.us-east-1.elb.amazonaws.com/agent-10052/",
    agentdeploymenttype: "deployed"
  },
  {
    id: "3",
    name: "Code Review Assistant",
    description:
      "Automated code review agent that analyzes pull requests and provides suggestions for improvements.",
    status: "training",
    version: "v0.9.1-beta",
    model: "CodeLlama",
    lastActivity: "30 minutes ago",
    performance: {
      successRate: 88.7,
      responseTime: 300,
      uptime: 98.5,
      errorRate: 5.2,
    },
    sessions: {
      total: 3420,
      costPerSession: 0.032,
    },
    tokens: {
      input: 2100000,
      output: 780000,
      total: 2880000,
    },
    tags: ["Development", "Code Review", "Quality"],
    agentAPI: "http://k8s-project1-project1-1d8c4ed009-587900353.us-east-1.elb.amazonaws.com/agent-10052/",
    agentdeploymenttype: "deployed"
  },
  {
    id: "4",
    name: "Data Analyst",
    description:
      "Advanced analytics agent that processes large datasets and generates insights and reports.",
    status: "active",
    version: "v3.0.1",
    model: "GPT-4",
    lastActivity: "1 hour ago",
    performance: {
      successRate: 96.1,
      responseTime: 120,
      uptime: 99.7,
      errorRate: 1.8,
    },
    sessions: {
      total: 22800,
      costPerSession: 0.089,
    },
    tokens: {
      input: 3200000,
      output: 1800000,
      total: 5000000,
    },
    tags: ["Analytics", "Data Science", "Reports"],
    agentAPI: "http://k8s-project1-project1-1d8c4ed009-587900353.us-east-1.elb.amazonaws.com/agent-10052/",
    agentdeploymenttype: "deployed"
  },
  {
    id: "5",
    name: "Translation Service",
    description:
      "Multi-language translation agent supporting 50+ languages with context-aware translations.",
    status: "error",
    version: "v2.3.0",
    model: "mT5",
    lastActivity: "2 hours ago",
    performance: {
      successRate: 89.3,
      responseTime: 180,
      uptime: 97.2,
      errorRate: 8.7,
    },
    sessions: {
      total: 12300,
      costPerSession: 0.052,
    },
    tokens: {
      input: 1850000,
      output: 1650000,
      total: 3500000,
    },
    tags: ["Translation", "Multilingual", "Communication"],
    agentAPI: "http://k8s-project1-project1-1d8c4ed009-587900353.us-east-1.elb.amazonaws.com/agent-10052/",
    agentdeploymenttype: "deployed"
  },
  {
    id: "6",
    name: "Sales Assistant",
    description:
      "AI-powered sales agent that qualifies leads, schedules meetings, and follows up with prospects.",
    status: "testing",
    version: "v1.5.4",
    model: "GPT-4",
    lastActivity: "15 minutes ago",
    performance: {
      successRate: 92.8,
      responseTime: 160,
      uptime: 99.1,
      errorRate: 2.9,
    },
    sessions: {
      total: 5680,
      costPerSession: 0.073,
    },
    tokens: {
      input: 950000,
      output: 1150000,
      total: 2100000,
    },
    tags: ["Sales", "Lead Generation", "CRM"],
    agentAPI: "http://k8s-project1-project1-1d8c4ed009-587900353.us-east-1.elb.amazonaws.com/agent-10052/",
    agentdeploymenttype: "deployed"
  },
];

const mockMetrics: DashboardMetrics = {
  totalAgents: mockAgents.length,
  activeAgents: mockAgents.filter((agent) => agent.status === "active").length,
  averagePerformance:
    mockAgents.reduce((sum, agent) => sum + (agent.performance?.successRate || 0), 0) /
    mockAgents.length,
  totalTests: mockAgents.reduce((sum, agent) => sum + (agent.sessions?.total || 0), 0),
  successRate:
    mockAgents.reduce((sum, agent) => sum + (agent.performance?.successRate || 0), 0) /
    mockAgents.length,
  averageResponseTime:
    mockAgents.reduce((sum, agent) => sum + (agent.performance?.responseTime || 0), 0) /
    mockAgents.length,
};

interface AgentHubProps {}

function AgentHub({}: AgentHubProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{field: string; direction: 'asc' | 'desc'}>({
    field: 'name',
    direction: 'asc'
  });
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use static data instead of API calls
  const agents = mockAgents;
  const metrics = mockMetrics;

  // Memoized filtered and sorted agents
  const filteredAndSortedAgents = useMemo(() => {
    if (!mockAgents || mockAgents.length === 0) {
      return [];
    }

    let filtered = [...mockAgents];

    // Apply search filter (only search by agent name)
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((agent) =>
        agent.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting with direction
    const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
    
    return filtered.sort((a, b) => {
      switch (sortConfig.field) {
        case "name":
          return multiplier * a.name.localeCompare(b.name);
        case "performance":
          return multiplier * ((b.performance?.successRate || 0) - (a.performance?.successRate || 0));
        case "cost":
          return multiplier * ((a.sessions?.costPerSession || 0) - (b.sessions?.costPerSession || 0));
        default:
          return 0;
      }
    });
  }, [searchQuery, sortConfig]);

  const handleTestAgent = (agent: Agent) => {
    router.push(`/playground?agent=${agent.id}`);
  };

  const handleConfigureAgent = (agentId: string) => {
    // Demo mode - show modal instead
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setIsModalOpen(true);
    }
  };

  const handleStartAgent = (agentId: string) => {
    // Demo mode - just show an alert
    alert(`Starting agent ${agentId}...`);
  };

  const handleStopAgent = (agentId: string) => {
    // Demo mode - just show an alert
    alert(`Stopping agent ${agentId}...`);
  };

  const handleCardClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
  };

  // No loading states needed since we're using static data

  return (
    <>
      <div className="space-y-8">
        {/* Agent Dashboard Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Agent Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage your AI agents from a single dashboard
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search agent by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px] pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-800"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <Select 
              value={sortConfig.field} 
              onValueChange={(value) => setSortConfig(prev => ({ 
                field: value, 
                direction: prev.direction 
              }))}
            >
              <SelectTrigger className="w-[140px] h-9">
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
              onClick={() => setSortConfig(prev => ({ 
                ...prev, 
                direction: prev.direction === 'asc' ? 'desc' : 'asc' 
              }))}
            >
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Key Performance Indicators
          </h3>
          <div className="space-y-6 bg-gradient-to-r from-violet-100 dark:from-violet-900/50 to-violet-200 dark:to-violet-800/50 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 @container">
            <KPIDashboard metrics={metrics} />
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* {filteredAndSortedAgents.map((agent: Agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onTest={handleTestAgent}
              onConfigure={handleConfigureAgent}
              onStart={handleStartAgent}
              onStop={handleStopAgent}
              onCardClick={handleCardClick}
            />
          ))} */}
        </div>

        {filteredAndSortedAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No agents found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

export { AgentHub };
export type { AgentHubProps };
