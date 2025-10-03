import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { PlatformStatus } from '@/types/hub';

interface PlatformStatusBadgeProps {
  status: PlatformStatus;
}

export function PlatformStatusBadge({ status }: PlatformStatusBadgeProps) {
  const configs = {
    active: {
      icon: CheckCircle,
      label: 'Ativa',
      className: 'bg-green-500/10 text-green-600 border-green-500/20'
    },
    maintenance: {
      icon: AlertCircle,
      label: 'Manutenção',
      className: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    inactive: {
      icon: XCircle,
      label: 'Inativa',
      className: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`text-xs ${config.className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
