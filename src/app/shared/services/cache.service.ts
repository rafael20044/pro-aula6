import { Injectable } from '@angular/core';

interface CacheEntry {
  url: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 55 * 60 * 1000; // 55 minutos (URLs de Supabase expiran en 1 hora)

  constructor() { }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.url;
  }

  set(key: string, url: string): void {
    this.cache.set(key, {
      url,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar entradas expiradas periódicamente
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}
