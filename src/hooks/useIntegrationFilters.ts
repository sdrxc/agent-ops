"use client";

import { useState, useMemo, useCallback } from "react";
import type { IntegrationTool, UnifiedCategory, DataOrigin } from "@/components/cards/IntegrationToolCard";

export type CategoryFilter = "all" | UnifiedCategory;
export type AuthTypeFilter = "all" | "none" | "requires_auth";
export type SortOption = "popular" | "recent" | "newest";

export interface IntegrationFilters {
  readonly search: string;
  readonly category: CategoryFilter;
  readonly includeExternal: boolean;
  readonly domain: string | null;
  readonly authType: AuthTypeFilter;
  readonly favoritesOnly: boolean;
  readonly sortBy: SortOption;
}

const DEFAULT_FILTERS: IntegrationFilters = {
  search: "",
  category: "all",
  includeExternal: true,
  domain: null,
  authType: "all",
  favoritesOnly: false,
  sortBy: "popular",
} as const;

const RAW_TO_UNIFIED_CATEGORY: Record<string, UnifiedCategory> = {
  "data source": "data-source",
  "output": "skill",
  "other": "skill",
};

function getToolCategory(tool: IntegrationTool): UnifiedCategory {
  if (tool.unifiedCategory) return tool.unifiedCategory;
  const rawCategory = tool.category?.toLowerCase() || "";
  return RAW_TO_UNIFIED_CATEGORY[rawCategory] || "data-source";
}

function getToolOrigin(tool: IntegrationTool): DataOrigin {
  return tool.dataOrigin || "internal";
}

function isValidDomain(group: string | null | undefined): group is string {
  return Boolean(group && group !== "string" && group !== "group");
}

function stableCompare(a: IntegrationTool, b: IntegrationTool, primaryCompare: number): number {
  return primaryCompare !== 0 ? primaryCompare : a.name.localeCompare(b.name);
}

function getTimestamp(dateStr: string | undefined): number {
  return dateStr ? new Date(dateStr).getTime() : 0;
}

export interface UseIntegrationFiltersOptions {
  tools: IntegrationTool[];
  allTools?: IntegrationTool[];
}

export interface UseIntegrationFiltersReturn {
  filters: IntegrationFilters;
  filteredTools: IntegrationTool[];
  availableDomains: string[];
  setSearch: (search: string) => void;
  setCategory: (category: CategoryFilter) => void;
  setIncludeExternal: (include: boolean) => void;
  setDomain: (domain: string | null) => void;
  setAuthType: (authType: AuthTypeFilter) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
  setSortBy: (sortBy: SortOption) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

export function useIntegrationFilters({
  tools,
  allTools,
}: UseIntegrationFiltersOptions): UseIntegrationFiltersReturn {
  const [filters, setFilters] = useState<IntegrationFilters>(DEFAULT_FILTERS);

  const availableDomains = useMemo(() => {
    const sourceTools = allTools || tools;
    const domains = new Set<string>();
    for (const tool of sourceTools) {
      if (isValidDomain(tool.group)) {
        domains.add(tool.group);
      }
    }
    return Array.from(domains).sort();
  }, [tools, allTools]);

  const filteredTools = useMemo(() => {
    let result = [...tools];

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description?.toLowerCase().includes(query) ||
          tool.category?.toLowerCase().includes(query) ||
          tool.usage_hint?.toLowerCase().includes(query)
      );
    }

    if (filters.category !== "all") {
      result = result.filter((tool) => getToolCategory(tool) === filters.category);
    }

    if (!filters.includeExternal) {
      result = result.filter((tool) => getToolOrigin(tool) === "internal");
    }

    if (filters.domain) {
      result = result.filter((tool) => tool.group === filters.domain);
    }

    if (filters.authType !== "all") {
      const wantsNoAuth = filters.authType === "none";
      result = result.filter((tool) => 
        wantsNoAuth ? tool.auth_type === "none" : tool.auth_type !== "none"
      );
    }

    if (filters.favoritesOnly) {
      result = result.filter((tool) => tool.favorited);
    }

    switch (filters.sortBy) {
      case "popular":
        result.sort((a, b) => stableCompare(a, b, b.total_stars - a.total_stars));
        break;
      case "recent":
        result.sort((a, b) => stableCompare(
          a, b, 
          getTimestamp(b.modification_date) - getTimestamp(a.modification_date)
        ));
        break;
      case "newest":
        result.sort((a, b) => stableCompare(
          a, b, 
          getTimestamp(b.creation_date) - getTimestamp(a.creation_date)
        ));
        break;
    }

    return result;
  }, [tools, filters]);

  const hasActiveFilters = 
    filters.category !== "all" ||
    !filters.includeExternal ||
    filters.domain !== null ||
    filters.authType !== "all" ||
    filters.favoritesOnly;

  const updateFilter = useCallback(<K extends keyof IntegrationFilters>(
    key: K,
    value: IntegrationFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setSearch = useCallback((v: string) => updateFilter("search", v), [updateFilter]);
  const setCategory = useCallback((v: CategoryFilter) => updateFilter("category", v), [updateFilter]);
  const setIncludeExternal = useCallback((v: boolean) => updateFilter("includeExternal", v), [updateFilter]);
  const setDomain = useCallback((v: string | null) => updateFilter("domain", v), [updateFilter]);
  const setAuthType = useCallback((v: AuthTypeFilter) => updateFilter("authType", v), [updateFilter]);
  const setFavoritesOnly = useCallback((v: boolean) => updateFilter("favoritesOnly", v), [updateFilter]);
  const setSortBy = useCallback((v: SortOption) => updateFilter("sortBy", v), [updateFilter]);
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  return {
    filters,
    filteredTools,
    availableDomains,
    setSearch,
    setCategory,
    setIncludeExternal,
    setDomain,
    setAuthType,
    setFavoritesOnly,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    resultCount: filteredTools.length,
  };
}

