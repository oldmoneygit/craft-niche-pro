import { Platform, VERTICAL_COLORS } from '@/types/hub';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoveVertical as MoreVertical, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { PlatformStatusBadge } from './PlatformStatusBadge';

interface PlatformDetailCardProps {
  platform: Platform;
}

export function PlatformDetailCard({ platform }: PlatformDetailCardProps) {
  const verticalColor = VERTICAL_COLORS[platform.vertical];

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border"
      style={{
        borderLeftColor: verticalColor,
        borderLeftWidth: '4px'
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
        style={{ backgroundColor: verticalColor }}
      />

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold" style={{ color: 'var(--hub-text-primary)' }}>
                {platform.name}
              </h3>
              <PlatformStatusBadge status={platform.status} />
            </div>
            <p className="text-sm" style={{ color: 'var(--hub-text-muted)' }}>
              {platform.subtitle}
            </p>
          </div>

          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <Badge
          className="mb-4"
          style={{
            backgroundColor: `${verticalColor}20`,
            color: verticalColor,
            borderColor: verticalColor
          }}
        >
          {platform.vertical.toUpperCase()}
        </Badge>

        <div className="grid grid-cols-2 gap-3">
          <MetricItem
            icon={Users}
            label="Profissionais"
            value={platform.metrics.professionals}
            color={verticalColor}
          />
          <MetricItem
            icon={TrendingUp}
            label="Clientes"
            value={platform.metrics.clients}
            color={verticalColor}
          />
          <MetricItem
            icon={FileText}
            label="Templates"
            value={platform.metrics.templates}
            color={verticalColor}
          />
          <MetricItem
            icon={DollarSign}
            label="Receita"
            value={`R$ ${(platform.metrics.monthly_revenue / 1000).toFixed(1)}K`}
            color={verticalColor}
          />
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--hub-border-primary)' }}>
          <div className="flex flex-wrap gap-2">
            {platform.features.slice(0, 3).map(feature => (
              <Badge
                key={feature}
                variant="outline"
                className="text-xs"
              >
                {feature}
              </Badge>
            ))}
            {platform.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{platform.features.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          <Button
            size="sm"
            className="flex-1"
            style={{
              backgroundColor: verticalColor,
              color: 'white'
            }}
          >
            Acessar
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface MetricItemProps {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}

function MetricItem({ icon: Icon, label, value, color }: MetricItemProps) {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-lg"
      style={{ backgroundColor: 'var(--hub-bg-tertiary)' }}
    >
      <div
        className="p-1.5 rounded"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate" style={{ color: 'var(--hub-text-muted)' }}>
          {label}
        </p>
        <p className="text-lg font-bold" style={{ color: 'var(--hub-text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
