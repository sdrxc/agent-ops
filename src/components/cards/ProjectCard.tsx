"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Calendar, Clock, UserCircle2, Bot, Copy } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  agentsCount: number;
  createdBy?: string;
  tags?: string[];
  status: "active" | "completed" | "onHold" | "deploying";
}

interface ProjectCardProps {
  project: Project;
  onExplore?: (projectId: string) => void;
  onConfigure?: (projectId: string) => void;
  onCardClick?: (project: Project) => void;
}

const getStatusDotColor = (status: Project["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "completed":
      return "bg-gray-500";
    case "onHold":
      return "bg-yellow-500";
    case "deploying":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusLabel = (status: Project["status"]) => {
  switch (status) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "onHold":
      return "On Hold";
    case "deploying":
      return "Deploying";
    default:
      return status;
  }
};

export function ProjectCard({
  project,
  onExplore,
  onCardClick,
}: ProjectCardProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(project.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClick = () => {
    onCardClick?.(project);
    onExplore?.(project.id);
    router.push(`/projects/${project.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-lg transition-all"
    >
      <CardHeader className="pt-3">
        <div className="flex items-end place-content-between w-full min-w-0">
          <button
            onClick={handleCopy}
            className="group flex items-center gap-1.5 mt-1 hover:text-primary transition-colors"
            title="Copy Project ID"
          >
            <span className="font-mono text-muted-foreground group-hover:text-primary text-xs truncate">
              {project.id}
            </span>
            {copied ? (
              <span className="text-primary text-xs shrink-0">Copied!</span>
            ) : (
              <Copy className="size-3 shrink-0" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {getStatusLabel(project.status)}
            </span>
            <div
              className={cn(
                "rounded-full w-2 h-2",
                getStatusDotColor(project.status)
              )}
            />
          </div>
        </div>
        <Separator />

        <CardTitle className="pt-2 text-xl">{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">

        <Table>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell className="p-0 py-1 w-24">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Updated</span>
                </div>
              </TableCell>
              <TableCell className="p-0 py-1 text-muted-foreground text-xs text-right">
                {project.updatedAt &&
                !isNaN(new Date(project.updatedAt).getTime())
                  ? format(new Date(project.updatedAt), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
            </TableRow>
            {project.createdBy && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="p-0 py-1 w-24">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <UserCircle2 className="w-3 h-3" />
                    <span className="font-medium">Owner</span>
                  </div>
                </TableCell>
                <TableCell className="p-0 py-1 text-muted-foreground text-xs text-right">
                  {project.createdBy}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{project.agentsCount}</span>
          <span className="text-muted-foreground text-xs">Agents</span>
        </div>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {project.tags.slice(0, 2).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-background px-1.5 py-0.5 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 2 && (
              <Badge variant="secondary" className="bg-background px-1.5 py-0.5 text-xs">
                +{project.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
