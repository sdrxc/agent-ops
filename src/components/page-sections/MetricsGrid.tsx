import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MetricItem {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

interface MetricsGridProps {
  metrics: MetricItem[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-0 shadow-xs bg-white/80 backdrop-blur-xs">
          <CardHeader className="p-4 pb-3 md:p-6 md:pb-3">
            <div className="flex items-center gap-2">
              {metric.icon && (
                <div className="text-muted-foreground">{metric.icon}</div>
              )}
              <span className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {metric.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
