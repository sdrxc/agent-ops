import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface KPICardData {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendPositive?: boolean;
}

interface KPIGridProps {
  cards: KPICardData[];
}

export function KPIGrid({ cards }: KPIGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 @lg:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-xs"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-md">
                <IconComponent className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xm font-bold text-gray-900">
                {card.value}
              </div>
              {card.description && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
