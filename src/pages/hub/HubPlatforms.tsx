import { useState, useMemo } from 'react';
import { GridGradientBackground } from '@/components/hub/GridGradientBackground';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { PlatformDetailCard } from '@/components/hub/PlatformDetailCard';
import { PlatformFilters } from '@/components/hub/PlatformFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePlatforms } from '@/hooks/hub/usePlatforms';
import { VerticalType, PlatformStatus } from '@/types/hub';

export function HubPlatforms() {
  const { platforms, loading } = usePlatforms();
  const [selectedVertical, setSelectedVertical] = useState<VerticalType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PlatformStatus | null>(null);

  const filteredPlatforms = useMemo(() => {
    return platforms.filter(platform => {
      const matchesVertical = !selectedVertical || platform.vertical === selectedVertical;
      const matchesStatus = !selectedStatus || platform.status === selectedStatus;
      return matchesVertical && matchesStatus;
    });
  }, [platforms, selectedVertical, selectedStatus]);

  return (
    <>
      <GridGradientBackground />

      <div className="flex min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
        <HubSidebar />

        <main className="flex-1 p-10 relative transition-colors duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--hub-text-primary)' }}>
                  Plataformas
                </h1>
                <p className="mt-1" style={{ color: 'var(--hub-text-muted)' }}>
                  Gerencie todas as plataformas do ecossistema KorLab PAI
                </p>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90"
                style={{ backgroundColor: '#6366f1' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Plataforma
              </Button>
            </div>

            <PlatformFilters
              selectedVertical={selectedVertical}
              selectedStatus={selectedStatus}
              onVerticalChange={setSelectedVertical}
              onStatusChange={setSelectedStatus}
            />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p style={{ color: 'var(--hub-text-muted)' }}>Carregando plataformas...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPlatforms.map(platform => (
                    <PlatformDetailCard key={platform.id} platform={platform} />
                  ))}
                </div>

                {filteredPlatforms.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2" style={{ color: 'var(--hub-text-primary)' }}>
                        Nenhuma plataforma encontrada
                      </p>
                      <p style={{ color: 'var(--hub-text-muted)' }}>
                        Ajuste os filtros ou crie uma nova plataforma
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
