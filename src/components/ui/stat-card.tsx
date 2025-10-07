import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "purple";
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = "primary"
}: StatCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <div className={`w-12 h-12 ${variantClasses.iconBg} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${variantClasses.iconColor}`} />
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}
