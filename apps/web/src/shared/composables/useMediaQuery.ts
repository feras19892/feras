import { ref, onMounted, onUnmounted } from 'vue';

export function useMediaQuery(query: string) {
  const matches = ref(false);

  let mql: MediaQueryList;

  onMounted(() => {
    mql = window.matchMedia(query);
    matches.value = mql.matches;
    mql.addEventListener('change', (e) => {
      matches.value = e.matches;
    });
  });

  onUnmounted(() => {
    mql?.removeEventListener('change', () => {});
  });

  return { matches };
}
