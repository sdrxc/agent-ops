"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ProjectApiResponse } from "@/types/api";
import {
  PageHeader,
  PageToolbar,
  ContentGrid,
} from "@/components/page-sections";

export const ProjectDirectory = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectApiResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Implement when the SSO is active
  // const { data: session } = useSession();

  // fetch user details using globalcontext
  const { user, loading, refreshUser } = useGlobalContext();
  //   console.log("user in agentrix", user);

  // Call API only when user is loaded
  useEffect(() => {
    if (loading || !user?.userID) return; // wait until user is ready

    const fetchProjects = async () => {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const isLocalEnv = runtimeEnv === "local";

      const url = isLocalEnv
        ? `${baseURL}/api/listProjects`
        : `/api/listProjects`;

      try {
        setLoadingProjects(true);
        const res = await axios.post(url, {
          userID: user.userID,
        });

        if (res.status == 200 || res.status == 201) {
          if (Array.isArray(res.data)) {
            setProjects(res.data);
          } else if (
            res.data?.data &&
            Array.isArray(res.data?.data?.projects)
          ) {
            // handle case if backend later wraps inside { data: [] }
            setProjects(res.data.data.projects);
          } else {
            console.warn("Unexpected API response:", res.data);
            setProjects([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [loading, user?.userID]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!query.trim()) return projects;
    return projects.filter((p) => {
      const search = query.toLowerCase();
      return (
        p.projectName.toLowerCase().includes(search) ||
        p.Description?.toLowerCase().includes(search) ||
        p.Tags?.some((tag: string) => tag.toLowerCase().includes(search))
      );
    });
  }, [query, projects]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Deployments"
        description="View and manage agent deployments across projects"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push("/project-setup")}>
              <Plus className="mr-2 w-4 h-4" />
              New Project
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              <RefreshCcw className="mr-2 w-4 h-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Page Toolbar */}
      <PageToolbar
        searchPlaceholder="Search projects..."
        searchValue={query}
        onSearchChange={setQuery}
      />

      {/* Projects Grid */}
      <ContentGrid
        columns={{ sm: 1, md: 2, lg: 3 }}
        loading={loading || loadingProjects}
        empty={!loading && !loadingProjects && filteredProjects.length === 0}
      >
        {filteredProjects.map((p) => (
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
              status: (p.projectStatus as "active" | "completed" | "onHold" | "deploying") ?? "active",
            }}
            onExplore={(id) => router.push(`/projects/${id}`)}
            onConfigure={(id) => console.log("Config project:", p)}
            onCardClick={(project) =>
              console.log("Clicked project:", project)
            }
          />
        ))}
      </ContentGrid>
    </div>
  );
};
