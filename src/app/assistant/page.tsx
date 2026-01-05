"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  FilterToolbar,
  FilterToolbarResponsiveRow,
  FilterToolbarSearch,
  FilterToolbarResultCount,
} from "@/components/FilterToolbar";
import {
  Plus,
  FilePenLine,
  Search,
  Tag,
  Calendar,
  Edit2,
  Trash2,
  User,
  Users,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupingIcon } from "@/components/ui/custom-icons";

// Types for Blueprint (similar to Prompt from agent-studio-v3)
interface AssistantVersion {
  version: string;
  label: string; // e.g., "Production", "Experimental"
  content: string;
  variables: string[];
  updatedAt: string;
  author: string;
}

interface Assistant {
  id: string;
  name: string;
  description: string;
  tags: string[];
  versions: AssistantVersion[];
  latestVersion: string;
}

// Mock data - in production this would come from an API
const mockAssistants: Assistant[] = [
  {
    id: "a_1",
    name: "Customer Support Persona",
    description:
      "Standard friendly support agent prompt with refund guidelines.",
    tags: ["Support", "External"],
    latestVersion: "v2.1",
    versions: [
      {
        version: "v2.1",
        label: "Production",
        content: `You are a helpful customer support agent for Acme Corp. 
Your tone should be empathetic and concise.
When handling refunds, always ask for the order ID first.
Current User Context: {{user_context}}
History: {{chat_history}}`,
        variables: ["user_context", "chat_history"],
        updatedAt: "2 days ago",
        author: "Sarah J.",
      },
      {
        version: "v1.0",
        label: "Deprecated",
        content: `You are a support bot. Answer questions.`,
        variables: [],
        updatedAt: "2 months ago",
        author: "Mike T.",
      },
    ],
  },
  {
    id: "a_2",
    name: "SQL Query Generator",
    description: "Converts natural language to Snowflake SQL dialect.",
    tags: ["Dev", "Data", "Internal"],
    latestVersion: "v1.5",
    versions: [
      {
        version: "v1.5",
        label: "Staging",
        content: `You are an expert SQL Data Analyst.
Convert the following natural language request into a valid Snowflake SQL query.
Schema: {{schema_definition}}
Request: {{user_request}}
Do not explain, just output SQL.`,
        variables: ["schema_definition", "user_request"],
        updatedAt: "5 hours ago",
        author: "Dev User",
      },
    ],
  },
  {
    id: "a_3",
    name: "Cold Email Outreach",
    description: "Sales template for initial LinkedIn contact.",
    tags: ["Sales", "Marketing"],
    latestVersion: "v3.0",
    versions: [
      {
        version: "v3.0",
        label: "Draft",
        content: `Hi {{prospect_name}},
I noticed your work at {{company_name}} and was impressed by {{achievement}}.
Our solution helps teams like yours reduce cloud costs by 30%.
Would you be open to a 5-min chat?`,
        variables: ["prospect_name", "company_name", "achievement"],
        updatedAt: "Just now",
        author: "SalesTeam",
      },
    ],
  },
];

export default function AssistantPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [groupingEnabled, setGroupingEnabled] = useState(true); // Default to true to maintain current behavior
  const currentUser = "Dev User"; // Mocked current user - in production get from session

  // Filter assistants by ownership
  const myAssistants = mockAssistants.filter((assistant) => {
    const latest = assistant.versions.find(
      (v) => v.version === assistant.latestVersion
    );
    const author = latest?.author || "Unknown";
    return author === currentUser || author === "You";
  });

  const teamAssistants = mockAssistants.filter((assistant) => {
    const latest = assistant.versions.find(
      (v) => v.version === assistant.latestVersion
    );
    const author = latest?.author || "Unknown";
    return author !== currentUser && author !== "You";
  });

  // Filter by search query
  const filterAssistants = (assistants: Assistant[]) => {
    if (!searchQuery.trim()) return assistants;
    const query = searchQuery.toLowerCase();
    return assistants.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  };

  const filteredMyAssistants = filterAssistants(myAssistants);
  const filteredTeamAssistants = filterAssistants(teamAssistants);

  // Combined list for ungrouped view
  const allFilteredAssistants = filterAssistants(mockAssistants);

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this prompt? This action cannot be undone."
      )
    ) {
      // In production, call API to delete
      console.log("Delete prompt:", id);
    }
  };

  const handleEdit = (assistant: Assistant) => {
    router.push(`/assistant/${assistant.id}`);
  };

  const AssistantCard = ({
    assistant,
    isMine,
  }: {
    assistant: Assistant;
    isMine: boolean;
  }) => {
    const activeVersion =
      assistant.versions.find((v) => v.version === assistant.latestVersion) ||
      assistant.versions[0];

    return (
      <Card className="group flex flex-col hover:shadow-md h-full transition-all cursor-pointer">
        <CardContent className="flex flex-col p-6 h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <FilePenLine className="size-6" />
            </div>
            <div className="flex items-center gap-2">
              {activeVersion && (
                <Badge variant="outline" className="font-mono text-xs">
                  {activeVersion.version}
                </Badge>
              )}
              {isMine && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 size-8 text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(assistant.id);
                  }}
                  title="Delete Prompt"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <h3 className="mb-1 font-bold group-hover:text-primary text-lg transition-colors">
            {assistant.name}
          </h3>
          <p className="flex-1 mb-4 text-muted-foreground text-sm line-clamp-2">
            {assistant.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {assistant.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="font-medium text-xs"
              >
                <Tag className="mr-1 size-3" /> {tag}
              </Badge>
            ))}
          </div>

          {/* Variables Preview */}
          {activeVersion && activeVersion.variables.length > 0 && (
            <div className="bg-muted mb-4 p-2 border rounded font-mono text-muted-foreground text-xs truncate">
              <span className="mr-2 font-semibold select-none">VARS:</span>
              {activeVersion.variables.map((v) => `{{${v}}}`).join(" ")}
            </div>
          )}

          <div className="flex justify-between items-center mt-auto pt-4 border-t text-muted-foreground text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />{" "}
              {activeVersion?.updatedAt || "Just now"}
              <span className="mx-1">•</span>
              <span>{activeVersion?.author}</span>
            </div>
            <span className="flex items-center gap-1 hover:text-primary transition-colors">
              <Edit2 className="size-3" /> {isMine ? "Edit" : "View"}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalPrompts =
    filteredMyAssistants.length + filteredTeamAssistants.length;
  const allPrompts = mockAssistants.length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Prompt Manager"
          description="Manage undeployed agent prompts."
        />

        {/* Filter Toolbar */}
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
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background shadow-none py-2 pr-4 pl-9 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs text-sm transition-all"
              />
            </FilterToolbarSearch>

            {/* Spacer */}
            <div className="flex-1" />

            {/* New Prompt Button */}
            <Button onClick={() => router.push("/assistant/new")}>
              <Plus className="size-4" /> New Prompt
            </Button>
          </FilterToolbarResponsiveRow>
        </FilterToolbar>

        {/* Results count and View Toggle */}
        <div className="flex justify-between items-center">
          <FilterToolbarResultCount
            count={totalPrompts}
            total={searchQuery ? allPrompts : undefined}
            label="prompts"
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
                className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-md px-3"
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

        {groupingEnabled ? (
          // GROUPED VIEW (current behavior)
          <div className="space-y-8">
            {/* My Prompts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                <h2 className="font-semibold text-xl">My Prompts</h2>
                <Badge variant="secondary" className="ml-2">
                  {filteredMyAssistants.length}
                </Badge>
              </div>

              {filteredMyAssistants.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col justify-center items-center py-12 border-2 border-dashed text-muted-foreground text-center">
                    <FilePenLine className="opacity-20 mb-3 size-8" />
                    <p>No prompts found.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push("/assistant/new")}
                    >
                      <Plus className="mr-2 size-4" /> Create Your First Prompt
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Create New Placeholder Card */}
                  <div
                    className={
                      viewMode === "grid"
                        ? "gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "flex flex-col gap-2"
                    }
                  >
                    <Card
                      className="hover:bg-primary/5 border-2 hover:border-primary/50 border-dashed transition-all cursor-pointer"
                      onClick={() => router.push("/assistant/new")}
                    >
                      <CardContent
                        className={
                          viewMode === "grid"
                            ? "flex flex-col justify-center items-center gap-3 p-6 min-h-[220px] text-muted-foreground hover:text-primary transition-colors"
                            : "flex items-center gap-3 p-4 text-muted-foreground hover:text-primary transition-colors"
                        }
                      >
                        <div className="bg-muted p-3 rounded-full">
                          <Plus className="size-6" />
                        </div>
                        <span className="font-medium">Create New Prompt</span>
                      </CardContent>
                    </Card>

                    {filteredMyAssistants.map((assistant) => (
                      <div
                        key={assistant.id}
                        onClick={() => handleEdit(assistant)}
                      >
                        <AssistantCard assistant={assistant} isMine={true} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Team Prompts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <h2 className="font-semibold text-xl">Team Prompts</h2>
                <Badge variant="secondary" className="ml-2">
                  {filteredTeamAssistants.length}
                </Badge>
              </div>

              {filteredTeamAssistants.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col justify-center items-center py-12 border-2 border-dashed text-muted-foreground text-center">
                    <FilePenLine className="opacity-20 mb-3 size-8" />
                    <p>No team prompts found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col gap-2"
                  }
                >
                  {filteredTeamAssistants.map((assistant) => (
                    <div
                      key={assistant.id}
                      onClick={() => handleEdit(assistant)}
                    >
                      <AssistantCard assistant={assistant} isMine={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // UNGROUPED VIEW
          <div className="space-y-4">
            {allFilteredAssistants.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col justify-center items-center py-12 border-2 border-dashed text-muted-foreground text-center">
                  <FilePenLine className="opacity-20 mb-3 size-8" />
                  <p>No prompts found.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/assistant/new")}
                  >
                    <Plus className="mr-2 size-4" /> Create Your First Prompt
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-2"
                }
              >
                <Card
                  className="hover:bg-primary/5 border-2 hover:border-primary/50 border-dashed transition-all cursor-pointer"
                  onClick={() => router.push("/assistant/new")}
                >
                  <CardContent
                    className={
                      viewMode === "grid"
                        ? "flex flex-col justify-center items-center gap-3 p-6 min-h-[220px] text-muted-foreground hover:text-primary transition-colors"
                        : "flex items-center gap-3 p-4 text-muted-foreground hover:text-primary transition-colors"
                    }
                  >
                    <div className="bg-muted p-3 rounded-full">
                      <Plus className="size-6" />
                    </div>
                    <span className="font-medium">Create New Prompt</span>
                  </CardContent>
                </Card>

                {allFilteredAssistants.map((assistant) => {
                  const isMine = myAssistants.some(
                    (a) => a.id === assistant.id
                  );
                  return (
                    <div
                      key={assistant.id}
                      onClick={() => handleEdit(assistant)}
                    >
                      <AssistantCard assistant={assistant} isMine={isMine} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
