import { Button } from '@/components/ui/button';
import { VerticalType, PlatformStatus } from '@/types/hub';
import { Apple, Dumbbell, Heart, Brain, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';

interface PlatformFiltersProps {
  selectedVertical: VerticalType | null;
  selectedStatus: PlatformStatus | null;
  onVerticalChange: (vertical: VerticalType | null) => void;
  onStatusChange: (status: PlatformStatus | null) => void;
}

const VERTICALS = [
  { value: 'nutrition' as VerticalType, label: 'Nutrição', color: 'var(--primary)', icon: Apple },
  { value: 'fitness' as VerticalType, label: 'Fitness', color: '#f97316', icon: Dumbbell },
  { value: 'wellness' as VerticalType, label: 'Wellness', color: '#06b6d4', icon: Heart },
  { value: 'mental' as VerticalType, label: 'Mental', color: '#a855f7', icon: Brain }
];

export function PlatformFilters({
  selectedVertical,
  selectedStatus,
  onVerticalChange,
  onStatusChange
}: PlatformFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={selectedVertical === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onVerticalChange(null)}
      >
        Todas
      </Button>

      {VERTICALS.map(vertical => {
        const Icon = vertical.icon;
        const isSelected = selectedVertical === vertical.value;

        return (
          <Button
            key={vertical.value}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onVerticalChange(vertical.value)}
            style={{
              borderColor: isSelected ? vertical.color : undefined,
              backgroundColor: isSelected ? `${vertical.color}20` : undefined,
              color: isSelected ? vertical.color : undefined
            }}
          >
            <Icon className="w-4 h-4 mr-2" />
            {vertical.label}
          </Button>
        );
      })}

      <div className="w-px h-8 bg-border" />

      <Button
        variant={selectedStatus === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange(selectedStatus === 'active' ? null : 'active')}
        style={{
          borderColor: selectedStatus === 'active' ? 'var(--primary)' : undefined,
          backgroundColor: selectedStatus === 'active' ? 'var(--primary)20' : undefined,
          color: selectedStatus === 'active' ? 'var(--primary)' : undefined
        }}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Ativas
      </Button>

      <Button
        variant={selectedStatus === 'maintenance' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange(selectedStatus === 'maintenance' ? null : 'maintenance')}
        style={{
          borderColor: selectedStatus === 'maintenance' ? 'var(--warning)' : undefined,
          backgroundColor: selectedStatus === 'maintenance' ? 'var(--warning)20' : undefined,
          color: selectedStatus === 'maintenance' ? 'var(--warning)' : undefined
        }}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Manutenção
      </Button>
    </div>
  );
}
