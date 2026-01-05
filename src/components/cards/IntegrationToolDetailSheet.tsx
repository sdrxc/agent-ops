"use client";

import { useState } from "react";
import {
  Star,
  Database,
  FileOutput,
  Wrench,
  User,
  Calendar,
  Clock,
  Globe,
  Lock,
  Shield,
  Link,
  Key,
  Tag,
  Info,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { IntegrationTool } from "./IntegrationToolCard";

interface IntegrationToolDetailSheetProps {
  tool: IntegrationTool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Category configuration
const categoryConfig: Record<string, { icon: typeof Database; color: string }> = {
  "data source": { icon: Database, color: "bg-blue-100 text-blue-700" },
  "output": { icon: FileOutput, color: "bg-green-100 text-green-700" },
  "other": { icon: Wrench, color: "bg-gray-100 text-gray-700" },
};

// Detail row component for consistent styling
function DetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof User;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Icon className="mt-0.5 w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}

export function IntegrationToolDetailSheet({
  tool,
  open,
  onOpenChange,
}: IntegrationToolDetailSheetProps) {
  const [imageError, setImageError] = useState(false);

  if (!tool) return null;

  const {
    name,
    key,
    description,
    type,
    logo_url,
    category,
    group,
    total_stars,
    favorited,
    owner,
    auth_type,
    usage_hint,
    url,
    access,
    is_approved_by_admin,
    creation_date,
    modification_date,
  } = tool;

  const normalizedCategory = (category?.toLowerCase() || "other") as keyof typeof categoryConfig;
  const config = categoryConfig[normalizedCategory] || categoryConfig["other"];
  const CategoryIcon = config.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAuthTypeLabel = (authType?: string) => {
    const labels: Record<string, string> = {
      none: "No authentication required",
      oauth_obo: "OAuth (On-Behalf-Of)",
      api_key: "API Key",
    };
    return labels[authType || ""] || authType || "Unknown";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          {/* Logo and badges */}
          <div className="flex items-start gap-4">
            <div className="flex justify-center items-center bg-muted rounded-lg w-16 h-16 overflow-hidden shrink-0">
              {logo_url && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo_url}
                  alt={`${name} logo`}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <CategoryIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={type === "mcp" ? "default" : "secondary"}>
                  {type === "mcp" ? "MCP" : "Internal"}
                </Badge>
                {category && (
                  <Badge variant="outline" className={cn("capitalize", config.color)}>
                    {category}
                  </Badge>
                )}
                {is_approved_by_admin && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="mr-1 w-3 h-3" />
                    Approved
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="fill-amber-400 w-4 h-4 text-amber-400" />
                  <span className="font-medium text-sm">{total_stars}</span>
                </div>
                {access && (
                  <div className="flex items-center gap-1">
                    {access === "public" ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span className="text-sm capitalize">{access}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SheetTitle className="text-xl">{name}</SheetTitle>
          <SheetDescription className="text-sm">{description}</SheetDescription>
        </SheetHeader>

        <Separator />

        {/* Details sections */}
        <div className="space-y-6 py-4">
          {/* Usage Hint */}
          {usage_hint && (
            <div className="bg-muted/50 p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2 font-medium text-sm">
                <Info className="w-4 h-4 text-blue-500" />
                Usage Hint
              </div>
              <p className="text-muted-foreground text-sm">{usage_hint}</p>
            </div>
          )}

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Technical Details</h4>

            <DetailRow icon={Tag} label="Key" value={<code className="bg-muted px-1.5 py-0.5 rounded text-xs">{key}</code>} />

            <DetailRow
              icon={Shield}
              label="Authentication"
              value={getAuthTypeLabel(auth_type)}
            />

            {url && (
              <DetailRow
                icon={Link}
                label="MCP URL"
                value={
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <span className="truncate">{url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                }
              />
            )}

            {group && <DetailRow icon={Tag} label="Group" value={group} />}
          </div>

          <Separator />

          {/* Owner & Dates */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Ownership & Timeline</h4>

            {owner ? (
              <DetailRow
                icon={User}
                label="Owner"
                value={
                  <div>
                    <p>{owner.full_name}</p>
                    <p className="text-muted-foreground text-xs">{owner.email}</p>
                  </div>
                }
              />
            ) : (
              <DetailRow icon={User} label="Owner" value="Bayer Internal Tool" />
            )}

            <DetailRow icon={Calendar} label="Created" value={formatDate(creation_date)} />

            <DetailRow icon={Clock} label="Last Modified" value={formatDate(modification_date)} />
          </div>
        </div>

        {/* Footer actions */}
        <Separator />
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {url && (
            <Button asChild className="flex-1">
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open MCP URL
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


















