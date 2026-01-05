"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KnowledgeStatsProps {
  totalDocs: number;
  totalChunks: number;
  storageUsed: string;
  className?: string;
}

export function KnowledgeStats({
  totalDocs,
  totalChunks,
  storageUsed,
  className,
}: KnowledgeStatsProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Total Documents</div>
          <div className="text-2xl font-bold mt-1">{totalDocs}</div>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Total Chunks</div>
          <div className="text-2xl font-bold mt-1">{totalChunks.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Storage Used</div>
          <div className="text-2xl font-bold mt-1">{storageUsed} MB</div>
        </CardContent>
      </Card>
    </div>
  );
}





















