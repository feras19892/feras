import type { ReportTemplate, ReportContext, ReportField } from '../types';
import {
  items, liquidMap, buretteTotalConsumedMap, buretteConsumedThisRefill,
} from '../../useChemistryLab';
import { isBurette, isReactionVessel } from '../../chemLabIds';

// ================== REPORT GENERATOR ==================
// Builds a report context from workspace state, then fills template fields.

export function buildReportContext(
  template: ReportTemplate,
  readingsCount: number,
): ReportContext {
  // Calculate consumed volume from all burettes
  let consumedVolume = 0;
  for (const item of items.value) {
    if (isBurette(item.id)) {
      consumedVolume += (buretteTotalConsumedMap[item.uid] || 0) + (buretteConsumedThisRefill[item.uid] || 0);
    }
  }

  // Find reaction vessel with indicator for pH/color
  let phAtEquivalence: number | null = null;
  let colorAtEquivalence = '#3b82f6';
  let precipitateColor: string | null = null;
  let gasType: string | null = null;
  let temperatureMax = 25;

  for (const item of items.value) {
    if (!isReactionVessel(item.id)) continue;
    const liq = liquidMap[item.uid];
    if (!liq || liq.volume <= 0) continue;
    if (liq.ph !== null && liq.ph !== undefined) phAtEquivalence = liq.ph;
    colorAtEquivalence = liq.color;
    if (liq.precipitate) precipitateColor = liq.precipitateColor || liq.color;
    if (liq.gasEvolution) gasType = liq.gasType || 'CO₂';
    if (liq.temperature > temperatureMax) temperatureMax = liq.temperature;
  }

  const defaults = template.defaults || {};

  return {
    consumedVolume,
    acidVolume: defaults.acidVolume ?? 50,
    baseMolarity: defaults.baseMolarity ?? 0.1,
    phAtEquivalence,
    colorAtEquivalence,
    readingsCount,
    precipitateColor,
    gasType,
    temperatureMax,
  };
}

export function generateReport(
  template: ReportTemplate,
  readingsCount: number,
): Record<string, string | number | null> {
  const ctx = buildReportContext(template, readingsCount);
  const result: Record<string, string | number | null> = {};

  for (const field of template.fields) {
    result[field.key] = resolveField(field, ctx);
  }

  return result;
}

function resolveField(field: ReportField, ctx: ReportContext): string | number | null {
  if (field.source === 'custom' && field.customFn) {
    return field.customFn(ctx);
  }

  switch (field.source) {
    case 'consumedVolume': return ctx.consumedVolume;
    case 'acidVolume': return ctx.acidVolume;
    case 'baseMolarity': return ctx.baseMolarity;
    case 'calculatedAcidMolarity':
      return ctx.consumedVolume > 0
        ? (ctx.baseMolarity * ctx.consumedVolume) / ctx.acidVolume
        : 0;
    case 'phAtEquivalence': return ctx.phAtEquivalence;
    case 'colorAtEquivalence': return ctx.colorAtEquivalence;
    case 'readingsCount': return ctx.readingsCount;
    case 'precipitateColor': return ctx.precipitateColor;
    case 'gasType': return ctx.gasType;
    case 'temperatureMax': return ctx.temperatureMax;
    default: return null;
  }
}
