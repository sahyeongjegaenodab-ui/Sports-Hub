interface CacheItem<T> {
  value: T;
  expiry: number;
}

class Cache {
  private store = new Map<string, CacheItem<any>>();

  set<T>(key: string, value: T, ttlSeconds: number) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  clear() {
    this.store.clear();
  }
}

export const cache = new Cache();
