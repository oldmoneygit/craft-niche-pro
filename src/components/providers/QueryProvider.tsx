import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configurações otimizadas do React Query para KorLab Nutri
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Configurações padrão otimizadas
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 30 * 60 * 1000, // 30 minutos (renomeado de cacheTime)
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          // Não tentar novamente para erros 4xx (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Tentar até 3 vezes para outros erros
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

// Instância singleton do QueryClient
export const queryClient = createQueryClient();

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <React.Suspense fallback={null}>
          <LazyReactQueryDevtools 
            initialIsOpen={false}
            position="bottom-right"
            toggleButtonProps={{
              style: {
                marginLeft: '5px',
                transform: 'none',
              },
            }}
          />
        </React.Suspense>
      )}
    </QueryClientProvider>
  );
}

// Lazy load DevTools para evitar problemas em produção
const LazyReactQueryDevtools = React.lazy(() =>
  import('@tanstack/react-query-devtools').then((d) => ({
    default: d.ReactQueryDevtools,
  }))
);

// Hook para acessar o QueryClient em qualquer lugar
export { useQueryClient } from '@tanstack/react-query';

// Utilitários para gerenciamento de cache
export const CacheUtils = {
  // Invalidar todas as queries de questionários
  invalidateQuestionnaires: () => {
    queryClient.invalidateQueries({ queryKey: ['questionnaires-list'] });
    queryClient.invalidateQueries({ queryKey: ['questionnaire-details'] });
    queryClient.invalidateQueries({ queryKey: ['questionnaire-responses'] });
  },

  // Invalidar queries de um tenant específico
  invalidateTenantQueries: (tenantId: string) => {
    queryClient.invalidateQueries({ queryKey: ['questionnaires-list', tenantId] });
    queryClient.invalidateQueries({ queryKey: ['clients', tenantId] });
    queryClient.invalidateQueries({ queryKey: ['appointments', tenantId] });
  },

  // Obter estatísticas do cache
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'pending').length,
      staleQueries: queries.filter(q => q.state.isStale).length,
      cacheSize: queries.length, // Simplificado
    };
  },
};
