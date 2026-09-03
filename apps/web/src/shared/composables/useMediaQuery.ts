import { ref, onMounted, onUnmounted } from 'vue';

export function useMediaQuery(query: string) {
  const matches = ref(false);

  let mql: MediaQueryList;
  let handler: ((e: MediaQueryListEvent) => void) | null = null;

  onMounted(() => {
    mql = window.matchMedia(query);
    matches.value = mql.matches;
    handler = (e) => { matches.value = e.matches; };
    mql.addEventListener('change', handler);
  });

  onUnmounted(() => {
    if (mql && handler) mql.removeEventListener('change', handler);
  });

  return { matches };
}
