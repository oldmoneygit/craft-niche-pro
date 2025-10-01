import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = "primary", trend }: StatCardProps) {
  const variantClasses = {
    primary: "from-primary to-primary/80",
    success: "from-success to-success/80",
    warning: "from-warning to-warning/80",
    info: "from-secondary to-secondary/80"
  };

  return (
    <Card className={`bg-gradient-to-br ${variantClasses[variant]} text-white hover-lift border-0 shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-8 h-8 opacity-80" />
          <span className="text-sm opacity-90">{title}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className={`text-sm ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
