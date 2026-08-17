import { ref, type Ref } from 'vue';

export function useSubTabs<T extends string>(initial: T, valid: T[]): { subTab: Ref<T>; setSubTab: (v: T) => void } {
  const subTab = ref<T>(initial) as Ref<T>;
  function setSubTab(v: T) {
    if (valid.includes(v)) subTab.value = v;
  }
  return { subTab, setSubTab };
}
