import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface UserPreferences {
  theme: 'dark' | 'light';
  fontSize: 'small' | 'medium' | 'large';
  autoRefresh: boolean;
  refreshInterval: number;
  defaultExperimentType: string;
  showChartOnLoad: boolean;
  compactTables: boolean;
}

const STORAGE_KEY = 'modapp_preferences';

const defaults: UserPreferences = {
  theme: 'dark',
  fontSize: 'medium',
  autoRefresh: true,
  refreshInterval: 30000,
  defaultExperimentType: 'physics',
  showChartOnLoad: true,
  compactTables: false,
};

function loadFromStorage(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const prefs = ref<UserPreferences>(loadFromStorage());

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.value));
    } catch { /* ignore */ }
  }

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    prefs.value[key] = value;
    save();
  }

  function reset() {
    prefs.value = { ...defaults };
    save();
  }

  watch(prefs, save, { deep: true });

  return {
    prefs,
    update,
    reset,
  };
});
