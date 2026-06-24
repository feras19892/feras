import { computed, ref } from 'vue';
import type { ChemAnalysisColumnMeta } from '../../types/chemistry';

export function useChemCalculations(
  readings: Record<string, number>[],
  columns: ChemAnalysisColumnMeta[]
) {
  const mBase = ref(0.1);
  const vAcid = ref(25.0);
  const eqPoint = ref<number | null>(null);
  const mAcidResult = ref<number | null>(null);
  const phFromConc = ref<number | null>(null);
  const hConc = ref(1e-7);
  const ohConc = ref(1e-7);
  const pOH = ref<number | null>(null);

  const equivalencePointData = computed(() => {
    if (!readings.length) return null;
    const vKey = columns.find(c => c.key === 'vAdded')?.key;
    const pHKey = columns.find(c => c.key === 'ph')?.key;
    if (!vKey || !pHKey) return null;
    const data = readings
      .map(r => ({ v: Number(r[vKey]) || 0, ph: Number(r[pHKey]) || 0 }))
      .filter(p => !isNaN(p.v) && !isNaN(p.ph))
      .sort((a, b) => a.v - b.v);
    if (data.length < 3) return null;
    let maxJumpIdx = 0;
    let maxJump = 0;
    for (let i = 1; i < data.length; i++) {
      const jump = Math.abs(data[i].ph - data[i - 1].ph);
      if (jump > maxJump) { maxJump = jump; maxJumpIdx = i; }
    }
    return { vEq: data[maxJumpIdx].v, phEq: data[maxJumpIdx].ph, maxJump };
  });

  const concTable = computed(() => {
    if (!readings.length) return [];
    const vKey = columns.find(c => c.key === 'vAdded')?.key;
    const pHKey = columns.find(c => c.key === 'ph')?.key;
    if (!vKey || !pHKey) return [];
    return readings
      .map(r => {
        const v = Number(r[vKey]) || 0;
        const ph = Number(r[pHKey]) || 0;
        const h = Math.pow(10, -ph);
        const oh = Math.pow(10, -(14 - ph));
        return { v, ph, h, oh };
      })
      .filter(r => !isNaN(r.v) && !isNaN(r.ph))
      .sort((a, b) => a.v - b.v);
  });

  function calcEquivalencePoint() {
    const ep = equivalencePointData.value;
    if (ep) {
      eqPoint.value = ep.vEq;
      mAcidResult.value = (mBase.value * ep.vEq) / vAcid.value;
    }
  }

  function calcPH() {
    if (hConc.value > 0) phFromConc.value = -Math.log10(hConc.value);
    else phFromConc.value = null;
  }

  function calcPOH() {
    if (ohConc.value > 0) {
      pOH.value = -Math.log10(ohConc.value);
      phFromConc.value = 14 - pOH.value;
    }
  }

  return {
    mBase, vAcid, eqPoint, mAcidResult,
    phFromConc, hConc, ohConc, pOH,
    equivalencePointData, concTable,
    calcEquivalencePoint, calcPH, calcPOH,
  };
}
