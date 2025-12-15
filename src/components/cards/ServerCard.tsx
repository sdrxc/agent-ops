"use client";

import { Globe, Lock, Share2, Server as ServerIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Custom 8-bit Server Icon Component inspired by the provided image
const PixelServerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    shapeRendering="crispEdges"
  >
    {/* Top Unit */}
    <path d="M2 2h20v1H2zM2 7h20v1H2zM2 2v6h1V2zM21 2v6h1V2z" />
    <path d="M5 4h5v2H5zM12 4h2v2H12zM15 4h2v2H15zM18 4h2v2H18z" />

    {/* Middle Unit */}
    <path d="M2 9h20v1H2zM2 14h20v1H2zM2 9v6h1V9zM21 9v6h1V9z" />
    <path d="M5 11h5v2H5zM12 11h2v2H12zM15 11h2v2H15zM18 11h2v2H18z" />

    {/* Bottom Unit */}
    <path d="M2 16h20v1H2zM2 21h20v1H2zM2 16v6h1V16zM21 16v6h1V16z" />
    <path d="M5 18h5v2H5zM12 18h2v2H12zM15 18h2v2H15zM18 18h2v2H18z" />

    {/* Connectors/Feet */}
    <path d="M4 7v2h2V7zM18 7v2h2V7z" />
    <path d="M4 14v2h2V14zM18 14v2h2V14z" />
  </svg>
);

export interface Server {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: "active" | "inactive" | "maintenance";
  serverType: "public" | "private" | "open";
  lastActivity?: string;
}

interface ServerCardProps {
  server?: Partial<Server>;
}

export function ServerCard({ server = {} }: ServerCardProps) {
  const router = useRouter();

  const {
    id = "unknown-server",
    name = "Unnamed Server",
    description,
    version = "0.0.0",
    status = "inactive",
    serverType = "public",
    lastActivity = "N/A",
  } = server;

  const statusColor = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    maintenance: "bg-yellow-500",
  }[status] || "bg-gray-400";

  const serverTypeConfig = {
    public: { label: "Public", icon: Globe },
    private: { label: "Private", icon: Lock },
    open: { label: "Open", icon: Share2 },
  }[serverType] || { label: serverType, icon: ServerIcon };

  return (
    <div className="relative w-full h-full">
      <Card
        onClick={() => router.push(`/servers/${encodeURIComponent(id)}`)}
        className="group flex flex-col hover:shadow-lg h-full overflow-hidden transition hover:-translate-y-1 duration-300 cursor-pointer"
      >
        <CardHeader className="space-y-2 p-4 py-3">
          {/* Top Row: Icon and Status */}
          <div className="flex justify-between items-start w-full">
            <div className="flex justify-center items-center w-9 h-9 overflow-hidden">
              <div className="flex justify-center items-center w-full h-full text-foreground">
                <PixelServerIcon className="w-9 h-9" />
              </div>
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
          <div className="space-y-0">
            <CardTitle className="pb-0.5 font-semibold text-base truncate leading-tight tracking-tight">
              {name}
            </CardTitle>
            <CardDescription className="flex flex-col gap-2">

              {description && (
                <span className="text-muted-foreground text-xs line-clamp-2">
                  {description}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px]">
                <span className="font-mono">{id}</span> —
                <span className="flex items-center gap-1">
                  <i>{serverTypeConfig.label}</i>
                </span>
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
      </Card>
    </div>
  );
}
