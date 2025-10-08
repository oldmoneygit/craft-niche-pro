/**
 * Sistema de cache persistente para KorLab Nutri
 * Gerencia armazenamento local com TTL e invalidação automática
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version?: string;
}

export class CacheStorage {
  private static readonly PREFIX = 'kornutri-cache-';
  private static readonly VERSION = '1.0.0';

  /**
   * Recupera dados do cache com verificação de TTL
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!item) return null;
      
      const parsed: CacheItem<T> = JSON.parse(item);
      const maxAge = this.getMaxAge(key);
      
      // Verificar se expirou
      if (Date.now() - parsed.timestamp > maxAge) {
        this.remove(key);
        return null;
      }
      
      // Verificar versão
      if (parsed.version && parsed.version !== this.VERSION) {
        this.remove(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      this.remove(key);
      return null;
    }
  }

  /**
   * Armazena dados no cache com timestamp
   */
  static set<T>(key: string, data: T, customTTL?: number): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.VERSION,
      };
      
      localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify(item));
      
      // Log para debugging
      console.log(`Cache set: ${key} (TTL: ${customTTL || this.getMaxAge(key)}ms)`);
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Remove item específico do cache
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
      console.log(`Cache removed: ${key}`);
    } catch (error) {
      console.warn(`Cache remove error for key ${key}:`, error);
    }
  }

  /**
   * Limpa todo o cache do KorLab Nutri
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache cleared');
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Retorna tamanho do cache em bytes
   */
  static getSize(): number {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.PREFIX))
        .reduce((size, key) => {
          const item = localStorage.getItem(key);
          return size + (item ? item.length * 2 : 0); // 2 bytes per char
        }, 0);
    } catch {
      return 0;
    }
  }

  /**
   * Lista todas as chaves em cache
   */
  static getKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.PREFIX))
        .map(key => key.replace(this.PREFIX, ''));
    } catch {
      return [];
    }
  }

  /**
   * Obtém TTL máximo para cada tipo de chave
   */
  private static getMaxAge(key: string): number {
    const maxAges: Record<string, number> = {
      // Templates são quase estáticos
      'questionnaire-templates': 2 * 60 * 60 * 1000, // 2 horas
      'questionnaire-categories': 1 * 60 * 60 * 1000, // 1 hora
      
      // Dados de configuração
      'app-settings': 30 * 60 * 1000, // 30 minutos
      'user-preferences': 15 * 60 * 1000, // 15 minutos
      
      // Dados dinâmicos
      'questionnaires-list': 5 * 60 * 1000, // 5 minutos
      'questionnaire-details': 10 * 60 * 1000, // 10 minutos
      'questionnaire-responses': 2 * 60 * 1000, // 2 minutos
      
      // Dados de sessão
      'current-user': 24 * 60 * 60 * 1000, // 24 horas
      'tenant-info': 12 * 60 * 60 * 1000, // 12 horas
    };
    
    return maxAges[key] || 30 * 60 * 1000; // 30 min default
  }

  /**
   * Verifica se uma chave existe no cache
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Obtém informações sobre uma chave em cache
   */
  static getInfo(key: string): { age: number; size: number; exists: boolean } | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!item) return null;
      
      const parsed: CacheItem<any> = JSON.parse(item);
      const age = Date.now() - parsed.timestamp;
      const size = item.length * 2; // 2 bytes per char
      
      return { age, size, exists: true };
    } catch {
      return null;
    }
  }
}
