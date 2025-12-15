"use client";

import { Bot } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/api";
import { useRouter } from "next/navigation";

interface AgentCardProps {
  agent?: Partial<Agent>;
}

export function AgentCard({ agent = {} }: AgentCardProps) {
  const router = useRouter();

  const {
    id = "unknown-id",
    name = "Unnamed Agent",
    version = "v1.0.0",
    status = "inactive",
    agentdeploymenttype = "custom",
    lastActivity = "N/A",
    tags = [],
  } = agent;

  const statusColor = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    error: "bg-red-500",
    training: "bg-blue-500",
    testing: "bg-yellow-500",
  }[status] || "bg-gray-400";

  const deploymentTypeLabel = {
    deployed: "Deployed",
    registered: "Registered",
    custom: "Custom",
  }[agentdeploymenttype] || agentdeploymenttype;

  return (
    <div className="relative w-full h-full">
      <Card
        onClick={() => router.push(`/agents/${encodeURIComponent(id)}`)}
        className="group flex flex-col hover:shadow-lg h-full overflow-hidden hover:-translate-y-1 transition duration-300 cursor-pointer"
      >
        <CardHeader className="space-y-2 p-4 py-3">
          {/* Top Row: Avatar and Status */}
          <div className="flex justify-between items-start w-full">
            <Avatar
              className={cn(
                "bg-gradient-to-br from-[#10384F] to-[#89D329] -mt-1 w-10 h-10",
                status === "inactive" && "grayscale"
              )}
            >
              <AvatarImage
                src={`https://api.dicebear.com/9.x/shapes/svg?seed=${id}&backgroundColor=transparent`}
                alt={name}
                className="p-1"
              />
              <AvatarFallback className="bg-primary/5 text-primary">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>

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
            <CardDescription className="text-[10px]">
              <span className="font-mono">{id}</span> — <i>{deploymentTypeLabel}</i>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow gap-2 p-4">
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
    </div >
  );
}
