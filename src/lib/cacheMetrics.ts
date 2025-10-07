/**
 * Sistema de métricas de performance para cache
 * Monitora performance de queries e taxa de hit do cache
 */

interface QueryMetrics {
  queryKey: string;
  duration: number;
  timestamp: number;
  cacheHit?: boolean;
  error?: string;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  totalQueries: number;
  averageDuration: number;
  lastReset: number;
}

class CacheMetricsCollector {
  private metrics: QueryMetrics[] = [];
  private cacheStats: Record<string, CacheMetrics> = {};
  private readonly MAX_METRICS = 1000; // Limite para evitar vazamento de memória

  /**
   * Registra tempo de execução de uma query
   */
  trackQueryTime(queryKey: string, startTime: number, error?: string): void {
    const duration = Date.now() - startTime;
    
    this.metrics.push({
      queryKey,
      duration,
      timestamp: Date.now(),
      error,
    });

    // Limitar número de métricas
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Atualizar estatísticas por query
    this.updateQueryStats(queryKey, duration, !!error);

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Query: ${queryKey} - ${duration}ms${error ? ` (ERROR: ${error})` : ''}`);
    }

    // Enviar para analytics se disponível
    this.sendToAnalytics(queryKey, duration, !!error);
  }

  /**
   * Registra hit do cache
   */
  trackCacheHit(queryKey: string): void {
    this.updateCacheStats(queryKey, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cache HIT: ${queryKey}`);
    }
  }

  /**
   * Registra miss do cache
   */
  trackCacheMiss(queryKey: string): void {
    this.updateCacheStats(queryKey, false);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ Cache MISS: ${queryKey}`);
    }
  }

  /**
   * Obtém estatísticas de uma query específica
   */
  getQueryStats(queryKey: string): CacheMetrics | null {
    return this.cacheStats[queryKey] || null;
  }

  /**
   * Obtém todas as estatísticas
   */
  getAllStats(): Record<string, CacheMetrics> {
    return { ...this.cacheStats };
  }

  /**
   * Obtém métricas recentes
   */
  getRecentMetrics(limit: number = 50): QueryMetrics[] {
    return this.metrics
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Calcula taxa de hit do cache
   */
  getCacheHitRate(queryKey?: string): number {
    if (queryKey) {
      const stats = this.cacheStats[queryKey];
      if (!stats || stats.totalQueries === 0) return 0;
      return (stats.hits / stats.totalQueries) * 100;
    }

    // Taxa geral
    const allStats = Object.values(this.cacheStats);
    const totalHits = allStats.reduce((sum, stats) => sum + stats.hits, 0);
    const totalQueries = allStats.reduce((sum, stats) => sum + stats.totalQueries, 0);
    
    return totalQueries > 0 ? (totalHits / totalQueries) * 100 : 0;
  }

  /**
   * Obtém tempo médio de resposta
   */
  getAverageResponseTime(queryKey?: string): number {
    if (queryKey) {
      const stats = this.cacheStats[queryKey];
      return stats ? stats.averageDuration : 0;
    }

    // Média geral
    const allStats = Object.values(this.cacheStats);
    if (allStats.length === 0) return 0;
    
    return allStats.reduce((sum, stats) => sum + stats.averageDuration, 0) / allStats.length;
  }

  /**
   * Reseta todas as métricas
   */
  reset(): void {
    this.metrics = [];
    this.cacheStats = {};
    console.log('📊 Cache metrics reset');
  }

  /**
   * Exporta métricas para análise
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      stats: this.cacheStats,
      summary: {
        totalQueries: this.metrics.length,
        cacheHitRate: this.getCacheHitRate(),
        averageResponseTime: this.getAverageResponseTime(),
        exportTime: new Date().toISOString(),
      }
    }, null, 2);
  }

  /**
   * Atualiza estatísticas de uma query
   */
  private updateQueryStats(queryKey: string, duration: number, hasError: boolean): void {
    if (!this.cacheStats[queryKey]) {
      this.cacheStats[queryKey] = {
        hits: 0,
        misses: 0,
        totalQueries: 0,
        averageDuration: 0,
        lastReset: Date.now(),
      };
    }

    const stats = this.cacheStats[queryKey];
    stats.totalQueries++;
    
    // Atualizar média de duração
    stats.averageDuration = ((stats.averageDuration * (stats.totalQueries - 1)) + duration) / stats.totalQueries;
  }

  /**
   * Atualiza estatísticas de cache
   */
  private updateCacheStats(queryKey: string, isHit: boolean): void {
    if (!this.cacheStats[queryKey]) {
      this.cacheStats[queryKey] = {
        hits: 0,
        misses: 0,
        totalQueries: 0,
        averageDuration: 0,
        lastReset: Date.now(),
      };
    }

    const stats = this.cacheStats[queryKey];
    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    stats.totalQueries = stats.hits + stats.misses;
  }

  /**
   * Envia métricas para analytics
   */
  private sendToAnalytics(queryKey: string, duration: number, hasError: boolean): void {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'query_performance', {
        query_key: queryKey,
        duration_ms: duration,
        has_error: hasError,
        custom_map: {
          dimension1: queryKey,
          dimension2: hasError ? 'error' : 'success',
        }
      });
    }

    // PostHog (se disponível)
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('query_performance', {
        query_key: queryKey,
        duration_ms: duration,
        has_error: hasError,
      });
    }
  }
}

// Instância singleton
export const CacheMetrics = new CacheMetricsCollector();

// Hook para usar métricas no React
export const useCacheMetrics = () => {
  const getStats = (queryKey?: string) => {
    if (queryKey) {
      return CacheMetrics.getQueryStats(queryKey);
    }
    return CacheMetrics.getAllStats();
  };

  const getHitRate = (queryKey?: string) => CacheMetrics.getCacheHitRate(queryKey);
  const getAverageTime = (queryKey?: string) => CacheMetrics.getAverageResponseTime(queryKey);
  const getRecentMetrics = (limit?: number) => CacheMetrics.getRecentMetrics(limit);

  return {
    getStats,
    getHitRate,
    getAverageTime,
    getRecentMetrics,
    reset: () => CacheMetrics.reset(),
    export: () => CacheMetrics.exportMetrics(),
  };
};

// Declarações globais para TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    posthog?: {
      capture: (event: string, properties: any) => void;
    };
  }
}
