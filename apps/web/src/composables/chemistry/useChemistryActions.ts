import { ref, computed, watch, type Ref } from 'vue';
import {
  pendingChemicalFill, getLiquid, getBurette, getPipette,
  selectedChemical, hasSelectedChemicalMap, items, isBurette, isPipette,
  buretteTotalConsumedMap, buretteConsumedThisRefill, buretteInitialVolumeMap,
  chemicals,
} from './useChemistryLab';
import { isReactionVessel } from './chemLabIds';
import { applyIndicator } from './useReactionEngine';
import type { Chemical } from './useChemistryLab';
import type { LabItem } from './useChemistryTools';
import type { ToolState } from './chemLabTypes';
import type { ExperimentDefinition, TitrationReading, ReportData } from './experiments';
import { generateReport } from './experiments/reports';
import { useI18n } from '../useI18n';
import { useChemicalLocale } from './useChemicalLocale';
import {
  welcomeMessage, warnDangerousChemical, quickFactAbout,
  warnOnAction,
} from './useLabAssistant';
import { buretteWarning } from './useLabSimulation';
import { clearTitrationReadings } from './useTitrationRecorder';
import { pushMacroHistory } from './useChemistryHistory';

export function expNameKey(exp: ExperimentDefinition): string {
  return exp.nameKey;
}

export function expTheory(exp: ExperimentDefinition, t: (key: string) => string): import('./experiments').ResolvedExperimentTheory | null {
  if (!exp.theory) return null;
  return {
    title: t(exp.theory.titleKey),
    sections: exp.theory.sections.map((s) => ({ heading: t(s.headingKey), content: t(s.contentKey) })),
  };
}

export function useChemistryActions(
  activeExperiment: Ref<ExperimentDefinition | null>,
  titrationReadings: Ref<TitrationReading[]>,
  selectedItem: Ref<LabItem | null>,
  selectedState: Ref<ToolState | null>,
  canvasRef: Ref<{ resetLab: () => void; stepUndo: () => void; stepRedo: () => void } | null>,
) {
  const { t } = useI18n();
  const showReport = ref(false);
  const reportData = ref<ReportData | null>(null);
  const reportFields = ref<Record<string, string | number | null>>({});
  const reportTemplate = ref<{ type: string; fields: { key: string; labelKey: string; source: string }[] } | null>(null);

  const buretteConsumption = computed(() => {
    let total = 0, current = 0, initial = 0;
    items.value.forEach((item) => {
      if (isBurette(item.id)) {
        total += buretteTotalConsumedMap[item.uid] || 0;
        current += buretteConsumedThisRefill[item.uid] || 0;
        initial += buretteInitialVolumeMap[item.uid] || getBurette(item.uid).maxVolume;
      }
    });
    return { total, current, initial, grandTotal: total + current };
  });

  watch(activeExperiment, (exp) => {
    if (exp) welcomeMessage(t(expNameKey(exp)));
  });

  watch(selectedChemical, (chem) => {
    if (chem && activeExperiment.value) {
      const { getName } = useChemicalLocale();
      warnDangerousChemical(getName(chem.id), chem.id);
      quickFactAbout(chem.id);
    }
  });

  watch(buretteWarning, (warn) => {
    if (warn === 'approaching') warnOnAction('equivalenceApproaching');
    if (warn === 'equivalence') warnOnAction('equivalenceReached');
    if (warn === 'exceeded') warnOnAction('equivalenceExceeded');
  });

  function showReportManual() {
    if (!activeExperiment.value) return;
    const exp = activeExperiment.value;
    if ('nameKey' in exp && exp.reportTemplate) {
      const fields = generateReport(exp.reportTemplate, titrationReadings.value.length);
      reportFields.value = fields;
      reportTemplate.value = exp.reportTemplate;
      showReport.value = true;
      return;
    }
    const consumed = buretteConsumption.value.grandTotal;
    const target = items.value.find((i) => {
      if (!isReactionVessel(i.id)) return false;
      const liq = getLiquid(i.uid);
      return liq && liq.indicators && liq.indicators.length > 0;
    });
    const liq = target ? getLiquid(target.uid) : null;
    const actualAcidVolume = liq ? Math.max(1, liq.volume - consumed) : 50;
    const buretteItem = items.value.find((i) => isBurette(i.id));
    const buretteChemId = buretteItem ? getBurette(buretteItem.uid).chemicalId : null;
    const baseMolarity = buretteChemId ? (chemicals.find((c) => c.id === buretteChemId)?.concentration ?? 0.1) : 0.1;
    reportData.value = {
      experimentName: t(expNameKey(exp)),
      consumedVolume: consumed,
      acidVolume: actualAcidVolume,
      baseMolarity,
      calculatedAcidMolarity: consumed > 0 ? (baseMolarity * consumed) / actualAcidVolume : 0,
      phAtEquivalence: liq ? liq.ph : null,
      colorAtEquivalence: liq ? liq.color : '#3b82f6',
      readingsCount: titrationReadings.value.length,
    };
    showReport.value = true;
  }

  function addManualReading() {
    const grandTotal = buretteConsumption.value.grandTotal;
    const target = items.value.find((i) => {
      if (!isReactionVessel(i.id)) return false;
      const liq = getLiquid(i.uid);
      return liq && liq.indicators && liq.indicators.length > 0;
    });
    const liq = target ? getLiquid(target.uid) : null;
    const last = titrationReadings.value[titrationReadings.value.length - 1];
    if (last && Math.abs(last.volume - grandTotal) < 0.05) {
      last.ph = liq ? liq.ph : null;
      last.color = liq ? liq.color : '#3b82f6';
      return;
    }
    titrationReadings.value.push({
      n: titrationReadings.value.length + 1,
      volume: grandTotal,
      ph: liq ? liq.ph : null,
      color: liq ? liq.color : '#3b82f6',
    });
  }

  function restartExperiment() {
    showReport.value = false;
    reportData.value = null;
    reportFields.value = {};
    reportTemplate.value = null;
    titrationReadings.value = [];
    clearTitrationReadings();
    selectedItem.value = null;
    selectedState.value = null;
    canvasRef.value?.resetLab();
  }

  function onChemicalClick(chem: Chemical) {
    if (!pendingChemicalFill.value) return;
    const { uid, amount } = pendingChemicalFill.value;
    hasSelectedChemicalMap[uid] = true;
    pushMacroHistory();
    const targetItem = items.value.find((i: LabItem) => i.uid === uid);
    if (targetItem && isBurette(targetItem.id)) {
      const s = getBurette(uid);
      s.volume = Math.min(s.maxVolume, s.volume + amount);
      s.color = chem.color; s.opacity = chem.opacity; s.chemicalId = chem.id;
    } else if (targetItem && isPipette(targetItem.id)) {
      const pip = getPipette(uid);
      pip.volume = Math.min(pip.maxVolume, pip.volume + amount);
      pip.color = chem.color; pip.opacity = chem.opacity; pip.label = chem.id; pip.chemicalId = chem.id;
    } else {
      const liq = getLiquid(uid);
      if (chem.category === 'indicator') {
        const dropAmount = Math.min(amount, 5);
        liq.volume = Math.min(liq.maxVolume, liq.volume + dropAmount);
        if (!liq.indicators) liq.indicators = [];
        if (!liq.indicators.includes(chem.id)) liq.indicators.push(chem.id);
        if (!liq.chemicalId) liq.label = chem.id;
        else if (!liq.label.includes(chem.id)) liq.label = liq.label + ' + ' + chem.id;
        applyIndicator(chem.id, uid);
      } else {
        liq.volume = Math.min(liq.maxVolume, liq.volume + amount);
        liq.color = chem.color; liq.opacity = chem.opacity; liq.label = chem.id;
        liq.chemicalId = chem.id; liq.ph = chem.ph ?? null; liq.baseColor = chem.color;
        if (!liq.reactants) liq.reactants = {};
        liq.reactants[chem.id] = (liq.reactants[chem.id] || 0) + amount;
      }
    }
    pendingChemicalFill.value = null;
  }

  return {
    showReport, reportData, reportFields, reportTemplate,
    buretteConsumption, showReportManual, addManualReading,
    restartExperiment, onChemicalClick,
  };
}
