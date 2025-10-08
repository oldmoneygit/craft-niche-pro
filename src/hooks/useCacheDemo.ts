import { useCallback, useEffect, useState } from 'react';
import { useCacheMetrics } from '@/lib/cacheMetrics';
import { CacheStorage } from '@/lib/cacheStorage';
import { queryClient } from '@/components/providers/QueryProvider';

/**
 * Hook de demonstração para testar o sistema de cache
 * Mostra métricas em tempo real e permite testar funcionalidades
 */
export const useCacheDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const cacheMetrics = useCacheMetrics();

  // Atualizar métricas a cada 5 segundos
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const stats = cacheMetrics.getStats();
      const hitRate = cacheMetrics.getHitRate();
      const avgTime = cacheMetrics.getAverageTime();
      const recentMetrics = cacheMetrics.getRecentMetrics(10);

      setMetrics({
        stats,
        hitRate,
        avgTime,
        recentMetrics,
        cacheSize: CacheStorage.getSize(),
        cacheKeys: CacheStorage.getKeys(),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, cacheMetrics]);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const clearCache = useCallback(() => {
    CacheStorage.clear();
    queryClient.clear();
    cacheMetrics.reset();
    setMetrics(null);
  }, [cacheMetrics]);

  const testCache = useCallback(async () => {
    console.log('🧪 Testing cache system...');
    
    // Test 1: Cache Storage
    const testData = { message: 'Hello Cache!', timestamp: Date.now() };
    CacheStorage.set('test-data', testData);
    const retrieved = CacheStorage.get('test-data');
    console.log('Cache Storage Test:', retrieved ? '✅ PASS' : '❌ FAIL');

    // Test 2: Query Client Cache
    try {
      await queryClient.prefetchQuery({
        queryKey: ['test-query'],
        queryFn: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { test: true };
        },
        staleTime: 10000,
      });
      console.log('Query Client Test: ✅ PASS');
    } catch (error) {
      console.log('Query Client Test: ❌ FAIL', error);
    }

    // Test 3: Metrics
    cacheMetrics.trackCacheHit('test-query');
    cacheMetrics.trackCacheMiss('test-query-2');
    console.log('Metrics Test: ✅ PASS');
  }, [cacheMetrics]);

  return {
    isVisible,
    toggleVisibility,
    clearCache,
    testCache,
    metrics,
  };
};
