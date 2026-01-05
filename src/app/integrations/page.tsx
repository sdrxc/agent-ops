"use client";

import { useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Server, Search, Plus, Rows3, LayoutGrid, ArrowUpDown, Heart, Globe, Box, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ServerCatalogue } from "@/domains/servers/ServerCatalogue";
import mcpToolsData from "@/app/api/listAvailableMCPTools/response.json";
import {
  IntegrationToolCard,
  type IntegrationTool,
} from "@/components/cards/IntegrationToolCard";
import { IntegrationToolDetailSheet } from "@/components/cards/IntegrationToolDetailSheet";
import { useIntegrationFilters } from "@/hooks/useIntegrationFilters";
import {
  FilterToolbar,
  FilterToolbarPrimaryRow,
  FilterToolbarResponsiveRow,
  FilterToolbarBlock,
  FilterToolbarSearch,
  FilterChip,
  FilterToolbarActiveFilters,
  FilterToolbarResultCount,
} from "@/components/FilterToolbar";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { generateMockUsageMetrics, transformToolsData } from "@/hooks/useIntegrationTools";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import ServerCreationDialogBox from "@/domains/deployment/components/steps/ServerCreationDialog";
import ToolCreationDialogBox from "@/domains/deployment/components/steps/ToolCreationDialog";
import { useDevMode } from "@/contexts/DevModeContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { Pagination } from "@/components/Pagination";

// Transform raw data: add mock usage metrics + unified categories + data origin
// TODO: Replace with useIntegrationTools hook when API fetching is needed
const rawTools = mcpToolsData.data.toolsMCP as IntegrationTool[];
const toolsWithMetrics = generateMockUsageMetrics(rawTools);
const transformedTools = transformToolsData(toolsWithMetrics);

type AddDialogType = "server" | "tool" | null;

const ITEMS_PER_PAGE = 20;

export default function IntegrationsPage() {
  const { user } = useGlobalContext();
  const { isDevMode } = useDevMode();
  const {
    studioMinStars,
    devModeMinStars,
    studioShowOthersOnFollowingPages,
    devModeShowOthersOnFollowingPages,
  } = useFeatureFlags();

  // Get current settings based on mode
  const showOthersOnFollowingPages = isDevMode ? devModeShowOthersOnFollowingPages : studioShowOthersOnFollowingPages;

  const [activeTab, setActiveTab] = useState("catalog");
  const [viewMode, setViewMode] = useState<"all" | "my-items" | "favorites">("all");
  const [selectedTool, setSelectedTool] = useState<IntegrationTool | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<AddDialogType>(null);
  const [catalogViewMode, setCatalogViewMode] = useState<"grid" | "list">("grid");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Simple search for servers/tools tabs (not using the filter hook)
  const [legacySearchQuery, setLegacySearchQuery] = useState("");

  // Local favorites state (in production, this would be persisted via API)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Apply favorites to transformed tools (unified catalog)
  const allTools = useMemo(
    () => transformedTools.map((tool) => ({
      ...tool,
      favorited: favorites.has(tool.key),
    })),
    [favorites]
  );

  // Filter tools based on view mode
  const ecosystemTools = useMemo(() => {
    if (viewMode === "all") return allTools;
    
    return allTools.filter((tool) => {
      if (viewMode === "favorites") {
        return tool.favorited;
      }
      
      // "my-items" mode: show tools created by current user
      if (viewMode === "my-items") {
        if (!user?.userID) return false;
        
        // Check if tool owner matches current user
        const isOwner = tool.owner?.id?.toString() === user.userID.toString() || 
                        tool.owner?.username === user.userName;
        return isOwner;
      }
      
      return true;
    });
  }, [allTools, viewMode, user]);

  // Single unified filter hook for all tools (filtered by view)
  // Pass allTools so domain filter always shows all available domains
  const catalogFilters = useIntegrationFilters({ tools: ecosystemTools, allTools });

  // Get current threshold based on mode
  const currentMinStars = isDevMode ? devModeMinStars : studioMinStars;

  // Split filtered tools into above-threshold (page 1) and below-threshold (page 2+)
  const { aboveThresholdTools, belowThresholdTools, paginatedTools, totalPages, totalItemsForPagination } = useMemo(() => {
    const filtered = catalogFilters.filteredTools;
    
    // If threshold is 0, all items are "above threshold" - normal pagination
    if (currentMinStars === 0) {
      const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedTools = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      return {
        aboveThresholdTools: filtered,
        belowThresholdTools: [],
        paginatedTools,
        totalPages,
        totalItemsForPagination: filtered.length,
      };
    }

    // Split by threshold
    const above = filtered.filter(tool => tool.total_stars >= currentMinStars);
    const below = filtered.filter(tool => tool.total_stars < currentMinStars);

    // If showOthersOnFollowingPages is false, only show above-threshold items
    if (!showOthersOnFollowingPages) {
      const totalPages = Math.ceil(above.length / ITEMS_PER_PAGE);
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedTools = above.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      return {
        aboveThresholdTools: above,
        belowThresholdTools: [],
        paginatedTools,
        totalPages,
        totalItemsForPagination: above.length,
      };
    }

    // With threshold: page 1 shows above-threshold items, subsequent pages show below-threshold
    const page1Items = above;
    const page1Count = page1Items.length;
    
    // Calculate total pages: page 1 for above-threshold + remaining pages for below-threshold
    const belowThresholdPages = below.length > 0 ? Math.ceil(below.length / ITEMS_PER_PAGE) : 0;
    const totalPages = page1Count > 0 ? 1 + belowThresholdPages : belowThresholdPages;

    let paginatedTools: IntegrationTool[];
    if (currentPage === 1) {
      paginatedTools = page1Items;
    } else {
      // Pages 2+ show below-threshold items with standard pagination
      const belowPageIndex = currentPage - 2; // Page 2 = index 0 of below items
      const startIndex = belowPageIndex * ITEMS_PER_PAGE;
      paginatedTools = below.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }

    return {
      aboveThresholdTools: above,
      belowThresholdTools: below,
      paginatedTools,
      totalPages: Math.max(1, totalPages),
      totalItemsForPagination: above.length + below.length,
    };
  }, [catalogFilters.filteredTools, currentMinStars, currentPage, showOthersOnFollowingPages]);

  // Reset page to 1 when any filter changes
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((key: string, favorited: boolean) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (favorited) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
    // TODO: In production, call API to persist favorite status
  }, []);

  const handleCardClick = (tool: IntegrationTool) => {
    setSelectedTool(tool);
    setSheetOpen(true);
  };

  const handleAddClick = (type: AddDialogType) => {
    if (type === "server" || type === "tool") {
      setAddDialogType(type);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset infrastructure search when switching tabs
    if (value === "catalog") {
      setLegacySearchQuery("");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Integrations"
          description="Manage your infrastructure and browse the MCP ecosystem."
        />

        <Tabs
          defaultValue="catalog"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Permanent Tabs: Ecosystem vs Infrastructure */}
          <TabsList className="grid grid-cols-2 bg-card mb-4 rounded-full w-fit h-auto text-gray-900">
            <TabsTrigger
              value="catalog"
              className="flex items-center gap-2 bg-background data-[state=active]:bg-gray-200 shadow-none rounded-full h-11 text-gray-600 text-lg"
            >
              <Box className="w-4 h-4" />
              MCP
            </TabsTrigger>
            <TabsTrigger
              value="infrastructure"
              className="flex items-center gap-2 bg-background data-[state=active]:bg-gray-200 shadow-none data-[state=active]:shadow-none rounded-full h-11 text-gray-950 text-lg"
            >
              <Server className="w-4 h-4" />
              Servers
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MCP ECOSYSTEM (Unified Catalog) */}
          <TabsContent value="catalog" className="mt-0">
            <FilterToolbar>
              {/* Primary Row: Category Toggle */}
              <FilterToolbarPrimaryRow>
                <SegmentedControl
                  value={catalogFilters.filters.category}
                  onValueChange={(value) => {
                    if (value) {
                      catalogFilters.setCategory(value as "all" | "skill" | "data-source");
                      resetPage();
                    }
                  }}
                  className="p-1"
                >
                  <SegmentedControlItem value="all" className="flex items-center gap-2">
                    All
                  </SegmentedControlItem>
                  <SegmentedControlItem value="skill" className="flex items-center gap-2">
                    Skills
                  </SegmentedControlItem>
                  <SegmentedControlItem value="data-source" className="flex items-center gap-2">
                    Data Sources
                  </SegmentedControlItem>
                </SegmentedControl>
              </FilterToolbarPrimaryRow>

              {/* Responsive Row: Search + Filters */}
              <FilterToolbarResponsiveRow>
                {/* Search */}
                <FilterToolbarSearch>
                  <Search className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                  <Input
                    type="text"
                    placeholder="Search MCP ecosystem..."
                    value={catalogFilters.filters.search}
                    onChange={(e) => {
                      catalogFilters.setSearch(e.target.value);
                      resetPage();
                    }}
                    className="bg-background shadow-none py-2 pr-4 pl-9 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs text-sm transition-all"
                  />
                </FilterToolbarSearch>

                {/* Filters */}
                <FilterToolbarBlock label="Filters">
                  {/* Domain */}
                  {catalogFilters.availableDomains.length > 0 && (
                    <Select
                      value={catalogFilters.filters.domain || "all"}
                      onValueChange={(value) => {
                        catalogFilters.setDomain(value === "all" ? null : value);
                        resetPage();
                      }}
                    >
                      <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[140px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Domains</SelectItem>
                        {catalogFilters.availableDomains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Include External Data - Clickable label with toggle */}
                  <label
                    className="flex items-center gap-2 bg-background hover:bg-accent py-0 pr-1 pl-1.5 border border-border rounded-lg h-8 font-medium text-foreground text-xs transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Show External
                    <Switch
                      checked={catalogFilters.filters.includeExternal}
                      onCheckedChange={(checked) => {
                        catalogFilters.setIncludeExternal(checked);
                        resetPage();
                      }}
                      className="ml-1 scale-75"
                    />
                  </label>
                </FilterToolbarBlock>

                {/* Sort */}
                <FilterToolbarBlock label="Sort">
                  <Select value={catalogFilters.filters.sortBy} onValueChange={(value) => {
                    catalogFilters.setSortBy(value as "popular" | "recent" | "newest");
                    resetPage();
                  }}>
                    <SelectTrigger className="flex [&>span]:flex-1 justify-start items-center gap-1 bg-background [&>svg:last-child]:ml-auto px-2 py-1 rounded-lg w-[140px] h-8 font-medium text-foreground text-xs [&>span]:text-left">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="recent">Recently Updated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterToolbarBlock>

                {/* My Items / Favorites Toggle Group */}
                <div className="flex h-6 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode(viewMode === "my-items" ? "all" : "my-items");
                      resetPage();
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 rounded-lg h-6 font-medium text-xs transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      viewMode === "my-items"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <User className="size-3" />
                    My Items
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode(viewMode === "favorites" ? "all" : "favorites");
                      resetPage();
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 rounded-lg h-6 font-medium text-xs transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      viewMode === "favorites"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Heart className="size-3" />
                    Favorites
                  </button>
                </div>
              </FilterToolbarResponsiveRow>
            </FilterToolbar>

          {/* Cards Grid Section */}
            {/* Active Filters + View Toggle Row */}
            <div className="flex justify-between items-center mt-6 mb-2">
              <div className="flex items-center gap-4">
                <FilterToolbarResultCount
                  count={catalogFilters.resultCount}
                  total={(catalogFilters.hasActiveFilters || viewMode !== "all") ? ecosystemTools.length : undefined}
                  label="integrations"
                />
                
                {(catalogFilters.hasActiveFilters || viewMode !== "all") && (
                  <FilterToolbarActiveFilters onClearAll={() => { catalogFilters.resetFilters(); setViewMode("all"); resetPage(); }}>
                    {catalogFilters.filters.search.trim() !== "" && (
                      <FilterChip
                        label="Search"
                        value={catalogFilters.filters.search}
                        onRemove={() => { catalogFilters.setSearch(""); resetPage(); }}
                        color="slate"
                      />
                    )}
                    {catalogFilters.filters.category !== "all" && (
                      <FilterChip
                        label="Type"
                        value={catalogFilters.filters.category === "skill" ? "Skills" : "Data Sources"}
                        onRemove={() => { catalogFilters.setCategory("all"); resetPage(); }}
                        color="purple"
                      />
                    )}
                    {catalogFilters.filters.domain !== null && (
                      <FilterChip
                        label="Domain"
                        value={catalogFilters.filters.domain}
                        onRemove={() => { catalogFilters.setDomain(null); resetPage(); }}
                        color="blue"
                      />
                    )}
                    {!catalogFilters.filters.includeExternal && (
                      <FilterChip
                        label="Source"
                        value="Internal Only"
                        onRemove={() => { catalogFilters.setIncludeExternal(true); resetPage(); }}
                        color="indigo"
                      />
                    )}
                    {viewMode === "favorites" && (
                      <FilterChip
                        label="View"
                        value="Favorites"
                        onRemove={() => { setViewMode("all"); resetPage(); }}
                        color="red"
                      />
                    )}
                    {viewMode === "my-items" && (
                      <FilterChip
                        label="View"
                        value="My Items"
                        onRemove={() => { setViewMode("all"); resetPage(); }}
                        color="purple"
                      />
                    )}
                  </FilterToolbarActiveFilters>
                )}
              </div>

              {/* View Type Toggle */}
              <ToggleGroup
                type="single"
                value={catalogViewMode}
                onValueChange={(value) => {
                  if (value) setCatalogViewMode(value as "grid" | "list");
                }}
                variant="outline"
                size="sm"
                className="gap-0 bg-gray-100 rounded-md"
              >
                <ToggleGroupItem value="grid" className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-none rounded-l-md">
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-md rounded-l-none">
                  <Rows3 className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Cards Grid */}
            {paginatedTools.length > 0 ? (
              <>
                <div className={catalogViewMode === "grid" 
                  ? "gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "flex flex-col gap-2"
                }>
                  {paginatedTools.map((tool) => (
                    <IntegrationToolCard
                      key={tool.key}
                      tool={tool}
                      onClick={() => handleCardClick(tool)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={totalItemsForPagination}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-muted-foreground text-center">
                No integrations found matching your filters.
              </p>
            )}
          </TabsContent>

          {/* TAB 2: SERVERS */}
          <TabsContent value="infrastructure" className="mt-0">
            <FilterToolbar>
              <FilterToolbarResponsiveRow>
                {/* Search */}
                <FilterToolbarSearch>
                  <Search className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                  <Input
                    type="text"
                    placeholder="Search servers..."
                    value={legacySearchQuery}
                    onChange={(e) => setLegacySearchQuery(e.target.value)}
                    className="bg-background shadow-none py-2 pr-4 pl-9 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs text-sm transition-all"
                  />
                </FilterToolbarSearch>

                {/* Spacer to push button to right */}
                <div className="flex-1" />

                {/* Deploy Server Button */}
                <Button onClick={() => handleAddClick("server")}>
                  <Plus className="mr-2 w-4 h-4" /> Deploy Server
                </Button>
              </FilterToolbarResponsiveRow>
            </FilterToolbar>

            {/* Server Catalogue */}
            <div className="mt-6">
              <ServerCatalogue 
                projectID="" 
                searchQuery={legacySearchQuery} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Sheet */}
      <IntegrationToolDetailSheet
        tool={selectedTool}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Add Server Dialog */}
      <Dialog open={addDialogType === "server"} onOpenChange={(open) => !open && setAddDialogType(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Server</DialogTitle>
          </DialogHeader>
          <ServerCreationDialogBox
            onClose={() => setAddDialogType(null)}
            projectID=""
          />
        </DialogContent>
      </Dialog>

      {/* Add Tool Dialog */}
      <Dialog open={addDialogType === "tool"} onOpenChange={(open) => !open && setAddDialogType(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tool</DialogTitle>
          </DialogHeader>
          <ToolCreationDialogBox onClose={() => setAddDialogType(null)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
