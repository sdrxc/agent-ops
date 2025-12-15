"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  chart?: ReactNode;
}

export function KPICard({ title, value, icon: Icon, description, chart }: KPICardProps) {
  return (
    <Card className="relative flex flex-col shadow-none h-full overflow-hidden transition-all duration-200">
      <CardHeader className="flex flex-row justify-between items-start space-y-0 px-4 py-4">
        {Icon && (
          <span className="top-2 -right-4 absolute text-primary/70">
            <Icon className="size-12" strokeWidth={0.75} aria-hidden="true" />
          </span>
        )}
        <CardTitle className="flex flex-col justify-between items-start w-full">
          <span className="pb-2 font-medium text-muted-foreground text-sm leading-none">{title}</span>
          <span className="font-bold text-foreground text-2xl leading-none tracking-wide">{value}</span>
        </CardTitle>
      </CardHeader>
      {chart && (<CardContent className="flex flex-col flex-1 px-4 pb-4">
        {chart ? chart : <div className="flex-1" />}
      </CardContent>)}
      <CardFooter className="flex flex-row justify-between items-center px-4 pt-0 pb-4">
        {description && (<span className="text-gray-500 text-xs">{description}</span>)}
      </CardFooter>
    </Card>
  );
}