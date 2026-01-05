"use client";

import { useState } from "react";
import { Star, Database, Zap, TrendingUp, Flame, KeyRound, Heart, Building2, Globe, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatRelativeDate, isWithinDays, formatCompactNumber } from "@/lib/utils";

// Unified category types (user-facing)
export type UnifiedCategory = "skill" | "data-source";

// Data origin types
export type DataOrigin = "internal" | "external";

// Interface matching the API response structure
export interface IntegrationTool {
  key: string;
  name: string;
  description?: string;
  type: "mcp" | "internal";
  logo_url?: string | null;
  logo_filename?: string | null;
  logo_url_expiration?: string | null;
  category?: string | null;
  group?: string | null;
  total_stars: number;
  favorited: boolean;
  owner?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  } | null;
  auth_type?: string;
  usage_hint?: string | null;
  url?: string | null;
  auth_scopes?: string | null;
  access?: "public" | "private" | string;
  is_approved_by_admin?: boolean;
  creation_date?: string;
  modification_date?: string;
  meta_data?: Record<string, string> | null;
  // Usage metrics (optional - from analytics API)
  usage_count?: number;
  last_used_at?: string;
  usage_trend?: "up" | "down" | "stable";
  // Unified catalog fields (computed)
  unifiedCategory?: UnifiedCategory;
  dataOrigin?: DataOrigin;
}

// Thresholds for badges
const POPULAR_THRESHOLD = 20; // Stars needed to show "Popular" badge
const RECENTLY_UPDATED_DAYS = 30; // Days to show "Updated recently" badge

interface IntegrationToolCardProps {
  tool: IntegrationTool;
  onClick?: () => void;
  onFavoriteToggle?: (key: string, favorited: boolean) => void;
  className?: string;
}

// Unified category configuration (user-facing labels)
const unifiedCategoryConfig: Record<UnifiedCategory, { label: string; icon: typeof Database; color: string }> = {
  "skill": { label: "Skill", icon: Zap, color: "bg-violet-100 text-violet-700" },
  "data-source": { label: "Data Source", icon: Database, color: "bg-blue-100 text-blue-700" },
};

// Data origin configuration for badges
const dataOriginConfig: Record<DataOrigin, { label: string; icon: typeof Building2; color: string; tooltip: string }> = {
  "internal": { 
    label: "Bayer", 
    icon: Building2, 
    color: "bg-teal-100 text-teal-700",
    tooltip: "Bayer internal data source - trusted enterprise data"
  },
  "external": { 
    label: "External", 
    icon: Globe, 
    color: "bg-orange-100 text-orange-700",
    tooltip: "External/public data source - internet or third-party data"
  },
};

// Legacy category mapping for fallback (when unifiedCategory not set)
const legacyCategoryMap: Record<string, UnifiedCategory> = {
  "data source": "data-source",
  "output": "skill",
  "other": "skill",
};

export function IntegrationToolCard({ tool, onClick, onFavoriteToggle, className }: IntegrationToolCardProps) {
  const [imageError, setImageError] = useState(false);

  const {
    key,
    name,
    description,
    logo_url,
    category,
    total_stars,
    favorited,
    modification_date,
    auth_type,
    usage_count,
    unifiedCategory,
    dataOrigin,
  } = tool;

  // Get unified category (use computed or fallback to legacy mapping)
  const effectiveCategory: UnifiedCategory = unifiedCategory || 
    legacyCategoryMap[category?.toLowerCase() || ""] || 
    "data-source";
  const categoryConfig = unifiedCategoryConfig[effectiveCategory];
  const CategoryIcon = categoryConfig.icon;

  // Get data origin config (default to internal if not set)
  const effectiveOrigin: DataOrigin = dataOrigin || "internal";
  const originConfig = dataOriginConfig[effectiveOrigin];
  const OriginIcon = originConfig.icon;

  // Compute activity badges
  const isPopular = total_stars >= POPULAR_THRESHOLD;
  const isRecentlyUpdated = modification_date && isWithinDays(modification_date, RECENTLY_UPDATED_DAYS);
  const requiresNoAuth = auth_type === "none";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onFavoriteToggle?.(key, !favorited);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        onClick={onClick}
        className={cn(
          "flex flex-col h-full overflow-hidden",
          "bg-card",
          "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
          onClick && "cursor-pointer",
          className
        )}
      >
        <CardHeader className="space-y-3 p-4 pb-2">
          {/* Top Row: Logo + Origin Badge | Right Badges */}
          <div className="flex justify-between items-start gap-2">
            {/* Left: Logo + Data Origin Badge */}
            <div className="flex items-center gap-2">
              {/* Logo */}
              <div className="flex justify-center items-center bg-muted rounded-md w-10 h-10 overflow-hidden shrink-0">
                {logo_url && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo_url}
                    alt={`${name} logo`}
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* NEW: MCP Badge */}
              {tool.type === "mcp" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] px-1.5 py-0 gap-0.5 font-medium"
                    >
                      <Box className="w-2.5 h-2.5" />
                      MCP
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Model Context Protocol
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Data Origin Badge (Internal/External) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={cn("font-medium text-[9px] px-1.5 py-0 gap-0.5", originConfig.color)}
                  >
                    <OriginIcon className="w-2.5 h-2.5" />
                    {originConfig.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[200px]">
                  {originConfig.tooltip}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right: Activity Badges + Category */}
            <div className="flex flex-wrap items-center gap-1 justify-end">
              {/* Popular Badge */}
              {isPopular && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0 font-medium gap-0.5"
                    >
                      <Flame className="w-2.5 h-2.5" />
                      Popular
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {total_stars}+ users starred this tool
                  </TooltipContent>
                </Tooltip>
              )}

              {/* No Auth Badge */}
              {requiresNoAuth && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0 font-medium gap-0.5"
                    >
                      <KeyRound className="w-2.5 h-2.5" />
                      Easy
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    No authentication required - ready to use
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Category Badge */}
              <Badge
                variant="secondary"
                className={cn("font-medium text-[9px] shrink-0 px-1.5 py-0", categoryConfig.color)}
              >
                {categoryConfig.label}
              </Badge>
            </div>
          </div>

          {/* Name and Stars + Favorite */}
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="font-semibold text-sm line-clamp-1 leading-tight">
              {name}
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              {/* Favorite Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleFavoriteClick}
                    className={cn(
                      "p-0.5 rounded transition-colors",
                      favorited 
                        ? "text-rose-500 hover:text-rose-600" 
                        : "text-muted-foreground hover:text-rose-400"
                    )}
                  >
                    <Heart className={cn("w-3.5 h-3.5", favorited && "fill-current")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {favorited ? "Remove from favorites" : "Add to favorites"}
                </TooltipContent>
              </Tooltip>
              
              {/* Stars */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="fill-amber-400 w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-xs">{total_stars}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-4 py-2">
          {/* Description */}
          <CardDescription className="text-xs line-clamp-2 leading-relaxed">
            {description || "No description available"}
          </CardDescription>
        </CardContent>

        <CardFooter className="flex items-center justify-between px-4 py-3 pt-0 gap-2">
          {/* Left: Last Updated */}
          <div className="flex items-center gap-1 text-muted-foreground min-w-0">
            <span className={cn(
              "text-[10px] truncate",
              isRecentlyUpdated && "text-emerald-600 font-medium"
            )}>
              Updated {modification_date ? formatRelativeDate(modification_date) : "Unknown"}
            </span>
          </div>

          {/* Right: Usage Count (if available) */}
          {typeof usage_count === "number" && usage_count > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-medium">
                    {formatCompactNumber(usage_count)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {usage_count.toLocaleString()} uses this month
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

