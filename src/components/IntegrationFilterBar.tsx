"use client";

import { Database, Zap, Heart, TrendingUp, Clock, Sparkles, Globe, ArrowUpDown, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CategoryFilter,
  SortOption,
  IntegrationFilters,
} from "@/hooks/useIntegrationFilters";

interface IntegrationFilterBarProps {
  filters: IntegrationFilters;
  availableDomains: string[];
  onCategoryChange: (category: CategoryFilter) => void;
  onIncludeExternalChange: (include: boolean) => void;
  onDomainChange: (domain: string | null) => void;
  onFavoritesChange: (favoritesOnly: boolean) => void;
  onSortChange: (sortBy: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof TrendingUp }[] = [
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "recent", label: "Recently Updated", icon: Clock },
  { value: "newest", label: "Newest", icon: Sparkles },
];

export function IntegrationFilterBar({
  filters,
  availableDomains,
  onCategoryChange,
  onIncludeExternalChange,
  onDomainChange,
  onFavoritesChange,
  onSortChange,
}: IntegrationFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Segmented Control + External Toggle + Favorites */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Segmented Control: All | Skills | Data Sources */}
        <div className="inline-flex rounded-lg border bg-muted p-0.5">
          <button
            onClick={() => onCategoryChange("all")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              filters.category === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            All
          </button>
          <button
            onClick={() => onCategoryChange("skill")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              filters.category === "skill"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="h-4 w-4" />
            Skills
          </button>
          <button
            onClick={() => onCategoryChange("data-source")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              filters.category === "data-source"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="h-4 w-4" />
            Data Sources
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* External Sources Toggle - Always visible (applies to both skills & data sources) */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
          <Checkbox
            checked={filters.includeExternal}
            onCheckedChange={(checked) => onIncludeExternalChange(checked === true)}
            className="h-4 w-4"
          />
          <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
            <Globe className="h-3.5 w-3.5" />
            Include external sources
          </span>
        </label>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Favorites Toggle */}
        <button
          onClick={() => onFavoritesChange(!filters.favoritesOnly)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filters.favoritesOnly
              ? "bg-rose-100 text-rose-700"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", filters.favoritesOnly && "fill-current")} />
          Favorites
        </button>
      </div>

      {/* Row 2: Domain Filter, Sort + Result Count */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Domain Dropdown */}
        {availableDomains.length > 0 && (
          <Select
            value={filters.domain || "all"}
            onValueChange={(value) => onDomainChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {availableDomains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Dropdown */}
        <Select value={filters.sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="h-8 w-[170px] text-xs justify-start gap-1.5 [&>svg:last-child]:hidden">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <SelectValue />
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
