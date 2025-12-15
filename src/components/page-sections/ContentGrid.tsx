import * as React from "react";
import { cn } from "@/lib/utils";

interface ContentGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  loading?: boolean;
  empty?: boolean;
}

export function ContentGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  loading = false,
  empty = false,
}: ContentGridProps) {
  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (empty) {
    return <div className="text-muted-foreground">No items found</div>;
  }

  const gridClasses = cn(
    "grid gap-6",
    columns.sm === 1 && "grid-cols-1",
    columns.sm === 2 && "grid-cols-2",
    columns.sm === 3 && "grid-cols-3",
    columns.sm === 4 && "grid-cols-4",
    columns.md === 1 && "md:grid-cols-1",
    columns.md === 2 && "md:grid-cols-2",
    columns.md === 3 && "md:grid-cols-3",
    columns.md === 4 && "md:grid-cols-4",
    columns.lg === 1 && "lg:grid-cols-1",
    columns.lg === 2 && "lg:grid-cols-2",
    columns.lg === 3 && "lg:grid-cols-3",
    columns.lg === 4 && "lg:grid-cols-4",
    columns.xl === 1 && "xl:grid-cols-1",
    columns.xl === 2 && "xl:grid-cols-2",
    columns.xl === 3 && "xl:grid-cols-3",
    columns.xl === 4 && "xl:grid-cols-4"
  );

  return <div className={gridClasses}>{children}</div>;
}
