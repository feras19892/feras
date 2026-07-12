import { useI18n } from '../useI18n';
import { getChemicalTranslation, chemistryChemicals } from '../../locales/chemistry-chemicals';

export function useChemicalLocale() {
  const { t, locale } = useI18n();

  const getName = (id: string) => getChemicalTranslation(id, locale.value).name;
  const getDesc = (id: string) => getChemicalTranslation(id, locale.value).desc;

  // Resolve a stored label to localized names
  const resolveLabel = (label: string | undefined) => {
    if (!label) return '';
    if (label === 'PIPETTE_SOLUTION') {
      return t('chemistryLab.pipetteSolution');
    }
    // Direct chemical ID lookup
    const byId = getChemicalTranslation(label, locale.value);
    if (byId.name !== label) return byId.name;
    const parts = label.split(' + ');
    const resolved = parts.map((part) => {
      for (const loc of ['ar', 'en', 'es'] as const) {
        const map = chemistryChemicals[loc];
        if (!map) continue;
        for (const [id, entry] of Object.entries(map)) {
          if (entry.name === part.trim()) {
            return getChemicalTranslation(id, locale.value).name;
          }
        }
      }
      return part;
    });
    return resolved.join(' + ');
  };

  return { getName, getDesc, resolveLabel };
}
