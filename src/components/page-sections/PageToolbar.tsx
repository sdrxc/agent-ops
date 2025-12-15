import * as React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface PageToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  actions,
}: PageToolbarProps) {
  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="md:flex-1"
        />
        {filters && <div className="flex gap-4">{filters}</div>}
        {actions && <div className="flex gap-4">{actions}</div>}
      </div>
    </div>
  );
}
