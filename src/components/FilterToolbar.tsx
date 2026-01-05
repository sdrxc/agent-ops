"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const CHIP_COLOR_CLASSES = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-green-50 text-green-700 border-green-100",
  red: "bg-red-50 text-red-700 border-red-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
} as const;

export interface FilterToolbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for filter toolbar with consistent styling
 */
function FilterToolbar({ children, className }: FilterToolbarProps) {
  return (
    <div className={cn("space-y-4 bg-gray-100 p-4 rounded-xl", className)}>
      {children}
    </div>
  );
}
FilterToolbar.displayName = "FilterToolbar";

export interface FilterToolbarPrimaryRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Primary row for segmented controls/view toggles - always single row
 */
function FilterToolbarPrimaryRow({ children, className }: FilterToolbarPrimaryRowProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
FilterToolbarPrimaryRow.displayName = "FilterToolbarPrimaryRow";

export interface FilterToolbarResponsiveRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive row that wraps blocks when space is limited
 * Blocks flow left-to-right with horizontal spacing (gap-x-10) and vertical spacing (gap-y-4)
 */
function FilterToolbarResponsiveRow({ children, className }: FilterToolbarResponsiveRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-10 gap-y-4", className)}>
      {children}
    </div>
  );
}
FilterToolbarResponsiveRow.displayName = "FilterToolbarResponsiveRow";

export interface FilterToolbarBlockProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * A block of related filter controls with optional label
 * Blocks can wrap to their own row when space is limited
 */
function FilterToolbarBlock({ children, label, className }: FilterToolbarBlockProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1", className)}>
      {label && (
        <span className="font-medium text-foreground text-xs tracking-wider">
          {label}:
        </span>
      )}
      {children}
    </div>
  );
}
FilterToolbarBlock.displayName = "FilterToolbarBlock";

export interface FilterToolbarSearchProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Search input wrapper with fixed width, doesn't wrap
 */
function FilterToolbarSearch({ children, className }: FilterToolbarSearchProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      {children}
    </div>
  );
}
FilterToolbarSearch.displayName = "FilterToolbarSearch";

export type FilterChipColor = keyof typeof CHIP_COLOR_CLASSES;

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  color?: FilterChipColor;
  className?: string;
}

/**
 * A removable chip/badge showing an active filter
 */
function FilterChip({ label, value, onRemove, color = "slate", className }: FilterChipProps) {
  const colorClass = CHIP_COLOR_CLASSES[color] ?? CHIP_COLOR_CLASSES.slate;

  const handleRemove = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove();
    },
    [onRemove]
  );

  return (
    <span
      className={cn(
        "flex items-center gap-1 px-2 py-0.5 border rounded-md text-xs",
        colorClass,
        className
      )}
    >
      <span className="opacity-70">{label}:</span>
      <span className="max-w-[100px] font-bold truncate">{value}</span>
      <button 
        type="button"
        onClick={handleRemove} 
        className="hover:text-black/70 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} />
      </button>
    </span>
  );
}
FilterChip.displayName = "FilterChip";

export interface FilterToolbarActiveFiltersProps {
  children: React.ReactNode;
  onClearAll?: () => void;
  clearAllLabel?: string;
  className?: string;
}

/**
 * Row for displaying active filter chips with optional "Clear all" button
 */
function FilterToolbarActiveFilters({ 
  children, 
  onClearAll, 
  clearAllLabel = "Clear all",
  className 
}: FilterToolbarActiveFiltersProps) {
  const handleClearAll = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onClearAll?.();
    },
    [onClearAll]
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
      {onClearAll && (
        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center gap-1 text-slate-400 hover:text-red-500 text-xs hover:underline transition-colors"
        >
          <X size={12} /> {clearAllLabel}
        </button>
      )}
    </div>
  );
}
FilterToolbarActiveFilters.displayName = "FilterToolbarActiveFilters";

export interface FilterToolbarResultCountProps {
  count: number;
  total?: number;
  label?: string;
  className?: string;
}

/**
 * Displays the result count, optionally showing "X of Y" when filtered
 * Example: "46 integrations" or "12 of 46 integrations"
 */
function FilterToolbarResultCount({ 
  count, 
  total, 
  label = "items",
  className 
}: FilterToolbarResultCountProps) {
  const showFiltered = total !== undefined && count !== total;
  
  return (
    <span className={cn("text-muted-foreground text-xs", className)}>
      {showFiltered ? `${count} of ${total}` : count} {label}
    </span>
  );
}
FilterToolbarResultCount.displayName = "FilterToolbarResultCount";

export {
  FilterToolbar,
  FilterToolbarPrimaryRow,
  FilterToolbarResponsiveRow,
  FilterToolbarBlock,
  FilterToolbarSearch,
  FilterChip,
  FilterToolbarActiveFilters,
  FilterToolbarResultCount,
};

