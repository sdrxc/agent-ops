"use client";

import { Bot, ExternalLink, FileText, Github, Globe, Lock } from "lucide-react";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/api";
import { useRouter } from "next/navigation";

interface AgentCardProps {
  agent?: Partial<Agent>;
  onClick?: () => void;
}

export function AgentCard({ agent = {}, onClick }: AgentCardProps) {
  const router = useRouter();

  const {
    id = "unknown-id",
    name = "Unnamed Agent",
    version = "v1.0.0",
    environment = "development",
    agentdeploymenttype = "custom",
    lastActivity = "N/A",
    tags = [],
    agentURL,
    provider,
    beatID,
    visibility = "private",
  } = agent;

  const environmentColor =
    {
      development: "bg-blue-500",
      staging: "bg-yellow-500",
      production: "bg-green-500",
    }[environment] || "bg-gray-400";

  const deploymentTypeLabel =
    {
      deployed: "Deployed",
      registered: "Registered",
      custom: "Custom",
    }[agentdeploymenttype] || agentdeploymenttype;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/agents/${encodeURIComponent(id)}`);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Prevent card navigation
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const truncateURL = (url: string, maxLen = 35) => {
    return url.length > maxLen ? url.slice(0, maxLen) + "..." : url;
  };

  return (
    <TooltipProvider>
      <div className="relative w-full h-full">
        <Card
          onClick={handleClick}
          className="group flex flex-col hover:shadow-lg h-full overflow-hidden hover:-translate-y-1 transition duration-300 cursor-pointer"
        >
          <CardHeader className="space-y-2 p-4 py-3">
            {/* Top Row: Avatar and Status */}
            <div className="flex justify-between items-start w-full">
              <Avatar
                className={cn(
                  "bg-gradient-to-br from-[#10384F] to-[#89D329] -mt-1 w-10 h-10",
                  environment === "development" && "grayscale"
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
                  {environment}
                </span>
                <div
                  className={cn(
                    "rounded-full w-2 h-2",
                    environmentColor,
                    environment === "production" && "animate-pulse"
                  )}
                />
              </div>
            </div>

            {/* Identity Section */}
            <div className="space-y-1">
              <CardTitle className="pb-0.5 font-semibold text-base truncate leading-tight tracking-tight">
                {name}
              </CardTitle>
              <CardDescription className="text-[10px]">
                <span className="font-mono">{id}</span> —{" "}
                <i>{deploymentTypeLabel}</i>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-2 p-4">
            <Separator />

            {/* Metadata Grid */}
            <div className="gap-4 grid grid-cols-2">
              <div className="flex flex-col">
                <span className="font-base text-[10px] text-muted-foreground tracking-wide">
                  Version
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-xs">
                    {version}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-base text-[10px] text-muted-foreground tracking-wide">
                  Last Activity
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs">{lastActivity}</span>
                </div>
              </div>

              {beatID && (
                <div className="flex flex-col">
                  <span className="font-base text-[10px] text-muted-foreground tracking-wide">
                    BeatID
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-xs">
                      {beatID}
                    </span>
                  </div>
                </div>
              )}

              {provider && (
                <div className="flex flex-col">
                  <span className="font-base text-[10px] text-muted-foreground tracking-wide">
                    Provider
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-xs truncate max-w-[100px]">
                      {provider.name}
                    </span>
                    {provider.githubURL && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) =>
                              handleLinkClick(e, provider.githubURL!)
                            }
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="View on GitHub"
                          >
                            <Github className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>View on GitHub</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-base text-[10px] text-muted-foreground tracking-wide">
                  Visibility
                </span>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] px-1.5 py-0 mt-0.5"
                >
                  {visibility === "public" ? (
                    <>
                      <Globe className="h-2.5 w-2.5 mr-1" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-2.5 w-2.5 mr-1" /> Private
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Agent URL Section */}
            {agentURL?.apiEndpoint && (
              <>
                <Separator className="my-2" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground tracking-wide">
                      API Endpoint
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-0">
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={agentURL.apiEndpoint}
                          onClick={(e) =>
                            handleLinkClick(e, agentURL.apiEndpoint)
                          }
                          className="text-xs text-blue-600 hover:underline truncate font-mono flex-1"
                        >
                          {truncateURL(agentURL.apiEndpoint)}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs break-all">
                        {agentURL.apiEndpoint}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {agentURL.swaggerDocs && (
                    <>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground tracking-wide">
                          Swagger Docs
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-0">
                        <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={agentURL.swaggerDocs}
                              onClick={(e) =>
                                handleLinkClick(e, agentURL.swaggerDocs!)
                              }
                              className="text-xs text-blue-600 hover:underline truncate font-mono flex-1"
                            >
                              {truncateURL(agentURL.swaggerDocs)}
                            </a>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs break-all">
                            {agentURL.swaggerDocs}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
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
                <span className="text-[10px] text-muted-foreground italic">
                  No tags
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}
