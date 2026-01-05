"use client";

import { useState, useMemo } from "react";
import { ServerCard } from "@/components/cards";
import { Folder, RefreshCcw } from "lucide-react";

// ---------------- MOCK DATA ----------------
type Server = {
  serverId: string;
  serverName: string;
  serverDesp: string;
  status: boolean;
  type: "public" | "private" | "open";
  version: string;
  metadata: Record<string, any>;
};

// Updated to show only the single AWS Deployment Server
const MOCK_SERVERS: Server[] = [
  {
    serverId: "aws-prod-001",
    serverName: "AWS Deployment Server",
    serverDesp: "Primary MCP infrastructure server connected to AWS ECS for agent deployments.",
    status: true,
    type: "private",
    version: "2.4.1",
    metadata: { owner: "Platform Team", lastUpdated: "2025-09-28" },
  }
];

interface ServerCatalogueProps {
  projectID: string;
  searchQuery?: string;
}

// ---------------- MAIN CATALOGUE ----------------
export const ServerCatalogue = ({ searchQuery = "" }: ServerCatalogueProps) => {
  const [servers] = useState<Server[]>(MOCK_SERVERS);
  const [loading] = useState(false);

  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) return servers;
    const lower = searchQuery.toLowerCase();
    return servers.filter(
      (s) =>
        s.serverName.toLowerCase().includes(lower) ||
        s.serverDesp.toLowerCase().includes(lower) ||
        s.serverId.toLowerCase().includes(lower)
    );
  }, [servers, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
        <RefreshCcw className="mb-4 w-10 h-10 animate-spin" />
        Fetching latest servers...
      </div>
    );
  }

  if (filteredServers.length === 0) {
    return (
      <div className="py-20 text-center">
        <Folder className="mx-auto mb-3 w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          No servers found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredServers.map((server) => (
        <div key={server.serverId} className="h-full">
          <ServerCard
            server={{
              id: server.serverId,
              name: server.serverName,
              description: server.serverDesp,
              version: server.version,
              status: server.status ? "active" : "inactive",
              serverType: server.type,
              lastActivity: server.metadata.lastUpdated,
            }}
          />
        </div>
      ))}
    </div>
  );
};
