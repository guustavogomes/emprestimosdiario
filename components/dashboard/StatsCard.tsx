import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50",
}: StatsCardProps) {
  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500">vs mês anterior</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              iconBgColor
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
