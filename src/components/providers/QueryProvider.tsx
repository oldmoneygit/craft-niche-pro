import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configurações otimizadas do React Query para KorLab Nutri
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Configurações padrão otimizadas
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 30 * 60 * 1000, // 30 minutos
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
    // Configurações de cache global
    queryCache: {
      // Log de queries para debugging
      onSuccess: (data, query) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Query success: ${query.queryKey.join('-')}`);
        }
      },
      onError: (error, query) => {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Query error: ${query.queryKey.join('-')}`, error);
        }
      },
    },
    mutationCache: {
      // Log de mutations para debugging
      onSuccess: (data, variables, context, mutation) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Mutation success: ${mutation.options.mutationKey?.join('-') || 'unknown'}`);
        }
      },
      onError: (error, variables, context, mutation) => {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Mutation error: ${mutation.options.mutationKey?.join('-') || 'unknown'}`, error);
        }
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

  // Prefetch questionários populares
  prefetchPopularQuestionnaires: async (tenantId: string) => {
    try {
      // Buscar questionários mais acessados
      const { data } = await queryClient.fetchQuery({
        queryKey: ['questionnaires-list', tenantId],
        queryFn: async () => {
          // Implementar lógica de prefetch baseada em popularidade
          return [];
        },
        staleTime: 5 * 60 * 1000,
      });

      // Prefetch detalhes dos questionários populares
      if (data && data.length > 0) {
        const popularIds = data.slice(0, 5).map((q: any) => q.id);
        
        await Promise.all(
          popularIds.map((id: string) =>
            queryClient.prefetchQuery({
              queryKey: ['questionnaire-details', id],
              queryFn: async () => {
                // Implementar fetch de detalhes
                return null;
              },
              staleTime: 10 * 60 * 1000,
            })
          )
        );
      }
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  },

  // Limpar cache de dados antigos
  clearOldCache: () => {
    // Remove queries que não foram usadas há mais de 1 hora
    queryClient.removeQueries({
      predicate: (query) => {
        const lastUpdated = query.state.dataUpdatedAt;
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        return lastUpdated < oneHourAgo;
      },
    });
  },

  // Obter estatísticas do cache
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'pending').length,
      staleQueries: queries.filter(q => q.state.isStale).length,
      cacheSize: JSON.stringify(cache).length,
    };
  },
};

// Configurar limpeza automática de cache
if (typeof window !== 'undefined') {
  // Limpar cache antigo a cada 30 minutos
  setInterval(() => {
    CacheUtils.clearOldCache();
  }, 30 * 60 * 1000);

  // Limpar cache quando a página for fechada
  window.addEventListener('beforeunload', () => {
    // Salvar estado importante antes de fechar
    const importantQueries = queryClient.getQueryCache()
      .getAll()
      .filter(q => {
        const key = q.queryKey.join('-');
        return key.includes('user-preferences') || key.includes('app-settings');
      });

    // Implementar salvamento se necessário
    console.log('Saving important queries before unload:', importantQueries.length);
  });
}
