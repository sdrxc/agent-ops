"use client";

import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Box, Cpu, Search } from "lucide-react";
import mcpToolsData from "@/app/api/listAvailableMCPTools/response.json";
import {
  IntegrationToolCard,
  type IntegrationTool,
} from "@/components/cards/IntegrationToolCard";
import { IntegrationToolDetailSheet } from "@/components/cards/IntegrationToolDetailSheet";

// Type assertion for the imported JSON data
const allTools = mcpToolsData.data.toolsMCP as IntegrationTool[];

export default function MCPRegistryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<IntegrationTool | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Split tools by type
  const mcpTools = useMemo(
    () => allTools.filter((tool) => tool.type === "mcp"),
    []
  );
  const internalTools = useMemo(
    () => allTools.filter((tool) => tool.type === "internal"),
    []
  );

  // Filter tools based on search query
  const filterTools = (tools: IntegrationTool[]) => {
    if (!searchQuery.trim()) return tools;
    const query = searchQuery.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.category?.toLowerCase().includes(query)
    );
  };

  const filteredMcpTools = filterTools(mcpTools);
  const filteredInternalTools = filterTools(internalTools);

  const handleCardClick = (tool: IntegrationTool) => {
    setSelectedTool(tool);
    setSheetOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="MCP Registry"
          description="Browse and manage MCP (Model Context Protocol) tools and internal integrations"
        />

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search tools by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mcp" className="w-full">
          <TabsList>
            <TabsTrigger value="mcp" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              MCP Tools ({filteredMcpTools.length})
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Internal Tools ({filteredInternalTools.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mcp" className="mt-6">
            {filteredMcpTools.length > 0 ? (
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMcpTools.map((tool) => (
                  <IntegrationToolCard
                    key={tool.key}
                    tool={tool}
                    onClick={() => handleCardClick(tool)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-muted-foreground text-center">
                No MCP tools found matching your search.
              </p>
            )}
          </TabsContent>

          <TabsContent value="internal" className="mt-6">
            {filteredInternalTools.length > 0 ? (
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredInternalTools.map((tool) => (
                  <IntegrationToolCard
                    key={tool.key}
                    tool={tool}
                    onClick={() => handleCardClick(tool)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-muted-foreground text-center">
                No internal tools found matching your search.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Sheet */}
      <IntegrationToolDetailSheet
        tool={selectedTool}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </Layout>
  );
}
