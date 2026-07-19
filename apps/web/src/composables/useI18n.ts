import { storeToRefs } from 'pinia';
import { useI18nStore } from '../stores/i18n.store';

export const useI18n = () => {
  const store = useI18nStore();
  const { locale, supported, direction, loading, messages } = storeToRefs(store);
  return {
    locale,
    supported,
    direction,
    loading,
    messages,
    t: store.t,
    tArray: store.tArray,
    setLocale: store.setLocale,
    bootstrap: store.bootstrap,
  };
};
