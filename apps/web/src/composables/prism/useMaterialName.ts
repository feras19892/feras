import { useI18nStore } from '../../stores/i18n.store'

export function useMaterialName() {
  const i18n = useI18nStore()

  function materialName(key: string): string {
    return i18n.t(`prism.materials.${key}`, key)
  }

  return { materialName }
}
