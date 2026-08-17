import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

export function useUrlTab(key: string, defaultTab: string, validTabs?: string[]) {
  const router = useRouter();
  const route = router.currentRoute;

  const fromUrl = route.value.query[key] as string | undefined;
  const initial = fromUrl && (!validTabs || validTabs.includes(fromUrl)) ? fromUrl : defaultTab;

  const tab = ref(initial);

  watch(tab, (val) => {
    const query = { ...route.value.query };
    if (val === defaultTab) {
      delete query[key];
    } else {
      query[key] = val;
    }
    router.replace({ query });
  });

  watch(() => route.value.query[key], (val) => {
    const newTab = (val as string) || defaultTab;
    if (validTabs && !validTabs.includes(newTab)) return;
    if (tab.value !== newTab) tab.value = newTab;
  });

  return tab;
}
