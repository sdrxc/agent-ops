"use client";

import { Wrench, Globe, Lock, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define Tool interface locally based on ToolCreationTemplate patterns
// and standard card requirements
export interface Tool {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: "active" | "inactive" | "deprecated" | "maintenance" | "quarantined";
  toolType: "public" | "private" | "open" | "utility";
  lastActivity?: string;
  tags?: string[];
}

interface ToolCardProps {
  tool?: Partial<Tool>;
}

export function ToolCard({ tool = {} }: ToolCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const {
    id = "unknown-tool",
    name = "Unnamed Tool",
    version = "0.0.0",
    status = "inactive",
    toolType = "public",
    lastActivity = "N/A",
    tags = [],
  } = tool;

  const statusColor = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    deprecated: "bg-red-500",
    maintenance: "bg-yellow-500",
    quarantined: "bg-orange-600",
  }[status] || "bg-gray-400";

  const toolTypeConfig = {
    public: { label: "Public", icon: Globe },
    private: { label: "Private", icon: Lock },
    open: { label: "Open", icon: Share2 },
    utility: { label: "Utility", icon: Wrench },
  }[toolType] || { label: toolType, icon: Wrench };

  const TypeIcon = toolTypeConfig.icon;

  // Try to guess the domain from the name for logo fetching
  // This is a simple heuristic; in a real app, the domain might be part of the tool data
  const getLogoUrl = (toolName: string) => {
    const commonTools: Record<string, string> = {
      "Snowflake": "snowflake.com",
      "Figma": "figma.com",
      "Github": "github.com",
      "ElasticSearch": "elastic.co",
      "Logfire": "logfire.ai", // Assuming
      "Codacy": "codacy.com",
      "Slack": "slack.com",
      "Jira": "atlassian.com",
      "Linear": "linear.app",
      "Notion": "notion.so",
    };

    // Check if any key is included in the tool name
    const foundKey = Object.keys(commonTools).find(key => 
      toolName.toLowerCase().includes(key.toLowerCase())
    );

    if (foundKey) {
      return `https://logo.clearbit.com/${commonTools[foundKey]}`;
    }
    
    return null;
  };

  const logoUrl = getLogoUrl(name);

  return (
    <div className="relative w-full h-full">
      <Card
        onClick={() => router.push(`/tools/${encodeURIComponent(id)}`)}
        className="group flex flex-col hover:shadow-lg h-full overflow-hidden hover:-translate-y-1 transition duration-300 cursor-pointer"
      >
        <CardHeader className="space-y-2 p-4 py-3">
          {/* Top Row: Icon and Status */}
          <div className="flex justify-between items-start w-full">
            <div className="flex justify-center items-center w-9 h-9 overflow-hidden">
               {logoUrl && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={logoUrl} 
                    alt={`${name} logo`}
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
               ) : (
                 <div className="flex justify-center items-center bg-primary/5 p-2 rounded-md w-full h-full text-primary">
                   <TypeIcon className="w-5 h-5" />
                 </div>
               )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-[10px] text-muted-foreground capitalize tracking-wider">
                {status}
              </span>
              {status !== "inactive" && (
                <div
                  className={cn(
                    "rounded-full w-2 h-2",
                    statusColor,
                    status === "active" && "animate-pulse"
                  )}
                />
              )}
            </div>
          </div>

          {/* Identity Section */}
          <div className="space-y-1">
            <CardTitle className="pb-0.5 font-semibold text-base truncate leading-tight tracking-tight">
              {name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-[10px]">
              <span className="font-mono">{id}</span> — 
              <span className="flex items-center gap-1">
                <i>{toolTypeConfig.label}</i>
              </span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 p-4 grow">
          <Separator />

          {/* Metadata Grid */}
          <div className="gap-4 grid grid-cols-2">
            <div className="flex flex-col">
              <span className="font-base text-[10px] text-muted-foreground tracking-wide">Version</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-medium text-xs">{version}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-base text-[10px] text-muted-foreground tracking-wide">Last Activity</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs">{lastActivity}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-4 pt-0">
          <div className="flex flex-wrap gap-1.5 w-full">
            {Array.isArray(tags) && tags.length > 0 ? (
              <>
                {tags.slice(0, 3).map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-secondary/50 hover:bg-secondary/70 px-1.5 py-0.5 text-[10px] text-secondary-foreground transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <span className="self-center pl-0.5 text-[10px] text-muted-foreground">
                    +{tags.length - 3}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">No tags</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
