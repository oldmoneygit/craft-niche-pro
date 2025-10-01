import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = "primary", 
  trend,
  className 
}: StatCardProps) {
  const variantStyles = {
    primary: {
      card: "bg-gradient-to-br from-primary to-primary/80 border-primary/20",
      icon: "text-white/90",
      text: "text-white",
      subtitle: "text-white/80"
    },
    success: {
      card: "bg-gradient-to-br from-green-500 to-emerald-600 border-green-500/20",
      icon: "text-white/90",
      text: "text-white",
      subtitle: "text-white/80"
    },
    warning: {
      card: "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-500/20",
      icon: "text-white/90",
      text: "text-white",
      subtitle: "text-white/80"
    },
    info: {
      card: "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500/20",
      icon: "text-white/90",
      text: "text-white",
      subtitle: "text-white/80"
    }
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      "hover-lift transition-all duration-300 border-2",
      styles.card,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Icon className={cn("w-8 h-8", styles.icon)} />
          <span className={cn("text-sm font-medium", styles.subtitle)}>{title}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className={cn("text-4xl font-bold mb-1", styles.text)}>{value}</p>
            {subtitle && (
              <p className={cn("text-sm", styles.subtitle)}>{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={cn(
              "text-sm font-semibold px-2 py-1 rounded-full",
              trend.isPositive 
                ? "bg-white/20 text-white" 
                : "bg-black/20 text-white"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
