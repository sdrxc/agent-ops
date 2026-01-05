"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Agent, ProjectApiResponse } from "@/types/api";

import { AgentCard } from "@/components/cards/AgentCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { usePageTitle } from "@/contexts/PageTitleContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  FilterToolbar,
  FilterToolbarResponsiveRow,
  FilterToolbarSearch,
  FilterToolbarResultCount,
} from "@/components/FilterToolbar";

import {
  Plus,
  LayoutGrid,
  BookOpen,
  Search,
  Rows3,
  Rocket,
  User,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ContentGrid } from "@/components/page-sections";
import { GroupingIcon } from "@/components/ui/custom-icons";
import { Badge } from "@/components/ui/badge";

interface AgentHubProps {}

export function AgentHub({}: AgentHubProps) {
  const router = useRouter();
  const { user } = useGlobalContext();
  const { setPageTitle } = usePageTitle();

  // Set page title for the layout header
  useEffect(() => {
    setPageTitle("My Agents", "Your one-stop destination for all your agents.");
  }, [setPageTitle]);

  // --- Shared State ---
  const [activeTab, setActiveTab] = useState("my-projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [groupingEnabled, setGroupingEnabled] = useState(false);

  // --- Agents State (Catalogue) ---
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // --- Projects State (Workflows) ---
  const [projects, setProjects] = useState<ProjectApiResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // ───────────────────────────────────────────────
  // Fetch Catalogue Agents
  // ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);

        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";

        const listCatalogueURL = isLocalEnv
          ? `${baseURL}/api/listCatalogueAgents`
          : `/api/listCatalogueAgents`;

        const result = await axios.post(listCatalogueURL, {
          userID: user?.userID,
        });

        let returnedAgents: Agent[] = Array.isArray(result.data)
          ? result.data
          : result.data?.data?.agents || [];

        setAgents(returnedAgents || []);
      } catch (err) {
        console.error("Error loading catalogue agents:", err);
        setAgents([]); // fallback
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [user?.userID]);

  // ───────────────────────────────────────────────
  // Fetch Projects (Workflows)
  // ───────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!user?.userID) return;
    console.log("🔄 Fetching projects...");
    try {
      setLoadingProjects(true);

      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";

      const listProjectsURL = isLocalEnv
        ? `${baseURL}/api/listProjects`
        : `/api/listProjects`;

      const projectsRes = await axios.post(listProjectsURL, {
        userID: user.userID,
      });

      let projectsData: ProjectApiResponse[] = [];
      if (projectsRes.status === 200 || projectsRes.status === 201) {
        projectsData = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : projectsRes.data?.data?.projects || [];
        console.log("📦 Received projects:", projectsData.length);
        setProjects(projectsData);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [user?.userID]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Refresh projects when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchProjects();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchProjects]);

  // ───────────────────────────────────────────────
  // Delete Project Handler
  // ───────────────────────────────────────────────
  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      try {
        const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const isLocalEnv = runtimeEnv === "local";

        const deleteProjectURL = isLocalEnv
          ? `${baseURL}/api/delete-project`
          : `/api/delete-project`;

        const response = await axios.post(deleteProjectURL, {
          projectID: projectId,
        });

        if (response.status === 200 || response.status === 201) {
          toast.success("Project deleted successfully!", {
            style: { background: "#dcfce7", color: "#166534" },
          });
          // Refresh the projects list
          fetchProjects();
        }
      } catch (err) {
        console.error("Error deleting project:", err);
        toast.error("Failed to delete project. Please try again.", {
          style: { background: "#fee2e2", color: "#b91c1c" },
        });
      }
    },
    [fetchProjects]
  );

  // ───────────────────────────────────────────────
  // Filter logic for Agents
  // ───────────────────────────────────────────────
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => agent.name?.toLowerCase().includes(query));
  }, [agents, searchQuery]);

  // ───────────────────────────────────────────────
  // Filter logic for Projects
  // ───────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const search = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(search) ||
        p.Description?.toLowerCase().includes(search) ||
        p.Tags?.some((tag: string) => tag.toLowerCase().includes(search))
    );
  }, [searchQuery, projects]);

  // ───────────────────────────────────────────────
  // Grouping logic for Projects
  // ───────────────────────────────────────────────
  const { myProjects, teamProjects } = useMemo(() => {
    if (!groupingEnabled || activeTab !== "my-projects") {
      return { myProjects: [], teamProjects: [] };
    }

    const my = filteredProjects.filter((p) => p.CreateBy === user?.userID);
    const team = filteredProjects.filter((p) => p.CreateBy !== user?.userID);

    return { myProjects: my, teamProjects: team };
  }, [groupingEnabled, filteredProjects, user?.userID, activeTab]);

  // ───────────────────────────────────────────────
  // Grouping logic for Agents
  // ───────────────────────────────────────────────
  const { myAgents, catalogueAgents } = useMemo(() => {
    if (!groupingEnabled || activeTab !== "agent-catalogue") {
      return { myAgents: [], catalogueAgents: [] };
    }

    // Get list of user's project IDs
    const userProjectIDs = new Set(projects.map((p) => p.projectID));

    const my = filteredAgents.filter(
      (agent) => agent.projectID && userProjectIDs.has(agent.projectID)
    );
    const catalogue = filteredAgents.filter(
      (agent) => !agent.projectID || !userProjectIDs.has(agent.projectID)
    );

    return { myAgents: my, catalogueAgents: catalogue };
  }, [groupingEnabled, filteredAgents, projects, activeTab]);

  // ───────────────────────────────────────────────
  // Helper for search placeholder
  // ───────────────────────────────────────────────
  const getSearchPlaceholder = () => {
    return activeTab === "my-projects"
      ? "Search projects..."
      : "Search agents...";
  };

  // ───────────────────────────────────────────────
  // Action handlers
  // ───────────────────────────────────────────────
  const handleTestAgent = (agent: Agent) => {
    router.push(`/playground?agent=${agent.id}`);
  };

  const handleCardClick = (agent: Agent) => {
    router.push(`/agents/${agent.id}`);
  };

  // ───────────────────────────────────────────────
  // Helper function for rendering project lists
  // ───────────────────────────────────────────────
  const renderProjectList = (
    projectsList: ProjectApiResponse[],
    showEmptyState: boolean = true
  ) => {
    if (viewMode === "grid") {
      return (
        <ContentGrid
          columns={{ sm: 1, md: 2, lg: 3 }}
          loading={false}
          empty={showEmptyState && projectsList.length === 0}
        >
          {projectsList.map((p) => (
            <ProjectCard
              key={p.projectID}
              project={{
                id: p.projectID,
                name: p.projectName,
                description: p.Description,
                createdAt: p.Creation,
                updatedAt: p.LastUpdate,
                agentsCount: p.agentsCount,
                createdBy: p.CreateBy,
                tags: p.Tags,
                status: (p.projectStatus as "active" | "completed" | "onHold" | "deploying") || "active",
              }}
              onExplore={(id) => router.push(`/projects/${id}`)}
              onDelete={handleDeleteProject}
            />
          ))}
        </ContentGrid>
      );
    } else {
      // List view
      return (
        <div className="flex flex-col gap-2">
          {projectsList.length === 0 && showEmptyState ? (
            <div className="py-8 text-muted-foreground text-center">
              No projects found.
            </div>
          ) : (
            projectsList.map((p) => (
              <ProjectCard
                key={p.projectID}
                project={{
                  id: p.projectID,
                  name: p.projectName,
                  description: p.Description,
                  createdAt: p.Creation,
                  updatedAt: p.LastUpdate,
                  agentsCount: p.agentsCount,
                  createdBy: p.CreateBy,
                  tags: p.Tags,
                  status: (p.projectStatus as "active" | "completed" | "onHold" | "deploying") || "active",
                }}
                onExplore={(id) => router.push(`/projects/${id}`)}
                onDelete={handleDeleteProject}
              />
            ))
          )}
        </div>
      );
    }
  };

  // ───────────────────────────────────────────────
  // Helper function for rendering agent lists
  // ───────────────────────────────────────────────
  const renderAgentList = (
    agentsList: Agent[],
    showEmptyState: boolean = true
  ) => {
    if (viewMode === "grid") {
      return (
        <ContentGrid
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          loading={false}
          empty={showEmptyState && agentsList.length === 0}
        >
          {agentsList.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </ContentGrid>
      );
    } else {
      // List view
      return (
        <div className="flex flex-col gap-2">
          {agentsList.length === 0 && showEmptyState ? (
            <div className="py-8 text-muted-foreground text-center">
              No agents found.
            </div>
          ) : (
            agentsList.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="My Agents"
          description="Manage your projects and explore the agent catalogue."
        />

        <Tabs
          defaultValue="my-projects"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setSearchQuery(""); // Clear search when switching tabs
          }}
          className="w-full"
        >
          {/* Tabs above the grey area */}
          <TabsList className="grid grid-cols-2 bg-card mb-4 rounded-full w-fit h-auto text-gray-900">
            <TabsTrigger
              value="my-projects"
              className="flex items-center gap-2 bg-background data-[state=active]:bg-gray-200 shadow-none rounded-full h-11 text-gray-600 text-lg"
            >
              <LayoutGrid className="w-4 h-4" />
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="agent-catalogue"
              className="flex items-center gap-2 bg-background data-[state=active]:bg-gray-200 shadow-none data-[state=active]:shadow-none rounded-full h-11 text-gray-950 text-lg"
            >
              <BookOpen className="w-4 h-4" />
              Agent Catalogue
            </TabsTrigger>
          </TabsList>

          {/* Filter Toolbar (grey area) */}
          <FilterToolbar>
            <FilterToolbarResponsiveRow>
              {/* Search */}
              <FilterToolbarSearch>
                <Search
                  className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
                  size={16}
                />
                <Input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background shadow-none py-2 pr-4 pl-9 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs text-sm transition-all"
                />
              </FilterToolbarSearch>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/deployments")}
                  variant="outline"
                >
                  <Rocket className="mr-2 w-4 h-4" />
                  Deploy an Agent
                </Button>
                <Button onClick={() => router.push("/projects/new")}>
                  <Plus className="mr-2 w-4 h-4" />
                  Create Project
                </Button>
              </div>
            </FilterToolbarResponsiveRow>
          </FilterToolbar>

          {/* Results count and View Toggle */}
          <div className="flex justify-between items-center mt-6 mb-2">
            <FilterToolbarResultCount
              count={
                activeTab === "my-projects"
                  ? filteredProjects.length
                  : filteredAgents.length
              }
              total={
                activeTab === "my-projects" ? projects.length : agents.length
              }
              label={activeTab === "my-projects" ? "projects" : "agents"}
            />

            <div className="flex items-center gap-2">
              {/* Grouping Toggle */}
              <ToggleGroup
                type="single"
                value={groupingEnabled ? "grouped" : "ungrouped"}
                onValueChange={(value) => {
                  setGroupingEnabled(value === "grouped");
                }}
                variant="outline"
                size="sm"
                className="gap-0 bg-gray-100 rounded-md"
              >
                <ToggleGroupItem
                  value="grouped"
                  className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background px-3 data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-md"
                >
                  <GroupingIcon className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* View Type Toggle */}
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "grid" | "list");
                }}
                variant="outline"
                size="sm"
                className="gap-0 bg-gray-100 rounded-md"
              >
                <ToggleGroupItem
                  value="grid"
                  className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-none rounded-l-md"
                >
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-md rounded-l-none"
                >
                  <Rows3 className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* TAB: MY PROJECTS (Workflows) */}
          <TabsContent value="my-projects" className="mt-4">
            {loadingProjects ? (
              <div className="py-8 text-muted-foreground text-center">
                Loading...
              </div>
            ) : groupingEnabled ? (
              // GROUPED VIEW
              <div className="space-y-8">
                {/* My Projects Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    <h2 className="font-semibold text-xl">My Projects</h2>
                    <Badge variant="secondary" className="ml-2">
                      {myProjects.length}
                    </Badge>
                  </div>
                  {myProjects.length === 0 ? (
                    <div className="py-8 border-2 border-dashed rounded-lg text-muted-foreground text-center">
                      No projects created by you.
                    </div>
                  ) : (
                    renderProjectList(myProjects, false)
                  )}
                </div>

                {/* Team Projects Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    <h2 className="font-semibold text-xl">Team Projects</h2>
                    <Badge variant="secondary" className="ml-2">
                      {teamProjects.length}
                    </Badge>
                  </div>
                  {teamProjects.length === 0 ? (
                    <div className="py-8 border-2 border-dashed rounded-lg text-muted-foreground text-center">
                      No team projects found.
                    </div>
                  ) : (
                    renderProjectList(teamProjects, false)
                  )}
                </div>
              </div>
            ) : (
              // UNGROUPED VIEW (current behavior)
              renderProjectList(filteredProjects, true)
            )}
          </TabsContent>

          {/* TAB: AGENT CATALOGUE */}
          <TabsContent value="agent-catalogue" className="mt-4">
            {loadingAgents ? (
              <div className="py-8 text-muted-foreground text-center">
                Loading...
              </div>
            ) : groupingEnabled ? (
              // GROUPED VIEW
              <div className="space-y-8">
                {/* My Agents Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    <h2 className="font-semibold text-xl">My Agents</h2>
                    <Badge variant="secondary" className="ml-2">
                      {myAgents.length}
                    </Badge>
                  </div>
                  {myAgents.length === 0 ? (
                    <div className="py-8 border-2 border-dashed rounded-lg text-muted-foreground text-center">
                      No agents from your projects.
                    </div>
                  ) : (
                    renderAgentList(myAgents, false)
                  )}
                </div>

                {/* Catalogue Agents Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    <h2 className="font-semibold text-xl">Catalogue Agents</h2>
                    <Badge variant="secondary" className="ml-2">
                      {catalogueAgents.length}
                    </Badge>
                  </div>
                  {catalogueAgents.length === 0 ? (
                    <div className="py-8 border-2 border-dashed rounded-lg text-muted-foreground text-center">
                      No catalogue agents found.
                    </div>
                  ) : (
                    renderAgentList(catalogueAgents, false)
                  )}
                </div>
              </div>
            ) : (
              // UNGROUPED VIEW (current behavior)
              renderAgentList(filteredAgents, true)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
