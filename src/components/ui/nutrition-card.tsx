import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface NutritionCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "info";
}

export function NutritionCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  action,
  children,
  className = "",
  variant = "default"
}: NutritionCardProps) {
  const variantClasses = {
    default: "border-border",
    success: "border-l-4 border-l-success",
    warning: "border-l-4 border-l-warning",
    info: "border-l-4 border-l-secondary"
  };

  return (
    <Card className={`hover-lift ${variantClasses[variant]} ${className}`}>
      {(title || Icon || action) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
