import { ref, onUnmounted, type Ref } from 'vue';

interface QueryOptions {
  staleTime?: number;
  refetchOnFocus?: boolean;
  enabled?: Ref<boolean>;
}

interface QueryEntry<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  lastFetch: number;
  promise: Promise<T> | null;
  subscribers: number;
}

declare global {
  interface Window { __queryFocusInit?: boolean }
}

const cache = new Map<string, QueryEntry<unknown>>();
const MAX_CACHE_SIZE = 500;
const FOCUS_LISTENERS = new Set<() => void>();

function evictOldestCacheEntry() {
  if (cache.size > MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

if (typeof window !== 'undefined' && !window.__queryFocusInit) {
  window.__queryFocusInit = true;
  window.addEventListener('focusin', () => {
    FOCUS_LISTENERS.forEach(fn => fn());
  });
}

export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: QueryOptions = {},
) {
  const staleTime = options.staleTime ?? 30_000;
  const data = ref<T | undefined>(undefined) as Ref<T | undefined>;
  const error = ref<Error | null>(null);
  const loading = ref(false);

  let entry = cache.get(key) as QueryEntry<T> | undefined;
  if (!entry) {
    entry = {
      data: undefined,
      error: null,
      loading: false,
      lastFetch: 0,
      promise: null,
      subscribers: 0,
    };
    cache.set(key, entry as QueryEntry<unknown>);
    evictOldestCacheEntry();
  }
  entry.subscribers++;

  function syncFromCache() {
    if (entry) {
      data.value = entry.data;
      error.value = entry.error;
      loading.value = entry.loading;
    }
  }

  async function execute(force = false) {
    if (!entry) return;
    const now = Date.now();
    if (!force && entry.data !== undefined && now - entry.lastFetch < staleTime) {
      syncFromCache();
      return entry.data;
    }

    if (entry.promise && !force) {
      await entry.promise;
      syncFromCache();
      return entry.data;
    }

    entry.loading = true;
    entry.error = null;
    syncFromCache();

    entry.promise = fetcher()
      .then((result) => {
        entry!.data = result;
        entry!.lastFetch = Date.now();
        entry!.error = null;
        return result;
      })
      .catch((err) => {
        entry!.error = err instanceof Error ? err : new Error(String(err));
        throw err;
      })
      .finally(() => {
        entry!.loading = false;
        entry!.promise = null;
        syncFromCache();
      });

    try {
      await entry.promise;
    } catch {
      // error already stored
    }
    return entry.data;
  }

  function refetch() {
    return execute(true);
  }

  function invalidate() {
    if (entry) entry.lastFetch = 0;
  }

  syncFromCache();
  if (options.enabled?.value === false) return;
  execute();

  if (options.refetchOnFocus) {
    const focusFn = () => {
      if (entry && Date.now() - entry.lastFetch > staleTime) {
        execute();
      }
    };
    FOCUS_LISTENERS.add(focusFn);
    onUnmounted(() => FOCUS_LISTENERS.delete(focusFn));
  }

  onUnmounted(() => {
    if (entry) entry.subscribers--;
  });

  return { data, error, loading, refetch, invalidate };
}

export function invalidateQuery(key: string) {
  const entry = cache.get(key);
  if (entry) entry.lastFetch = 0;
}

export function invalidatePattern(pattern: string) {
  for (const [key, entry] of cache) {
    if (key.startsWith(pattern)) entry.lastFetch = 0;
  }
}

export function setQueryData<T>(key: string, data: T) {
  let entry = cache.get(key) as QueryEntry<T> | undefined;
  if (!entry) {
    entry = {
      data,
      error: null,
      loading: false,
      lastFetch: Date.now(),
      promise: null,
      subscribers: 0,
    };
    cache.set(key, entry as QueryEntry<unknown>);
    evictOldestCacheEntry();
  } else {
    entry.data = data;
    entry.lastFetch = Date.now();
  }
}
