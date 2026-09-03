interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  
  set<T>(key: string, data: T, options: { ttl: number }) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: options.ttl
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    return item.data as T
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    return true
  }
  
  invalidate(key: string) {
    this.cache.delete(key)
  }
  
  invalidatePattern(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key)
    }
  }
  
  clear() {
    this.cache.clear()
  }
  
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl: number; staleWhileRevalidate?: boolean }
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      if (options.staleWhileRevalidate) {
        // في الخلفية: حدّث الكاش دون تعطيل المستخدم
        fetchFn().then(data => {
          this.set(key, data, options)
        }).catch(console.error)
      }
      return cached
    }
    const data = await fetchFn()
    this.set(key, data, options)
    return data
  }
}

export const cacheService = new CacheService()
