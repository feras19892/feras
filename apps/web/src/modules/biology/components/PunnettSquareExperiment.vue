<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
const { t } = useI18n();
import { computed, ref, watch } from 'vue';
import { useFullscreen } from '../../../composables/shared/useFullscreen';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

import { mendelTraits } from '../../../services/mendel-traits';
import type { MendelTrait } from '../../../services/mendel-traits';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import { useBiologyScreenshot } from '../../../composables/biology/useBiologyScreenshot';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { useRoute } from 'vue-router';
import { resolveExperimentId } from '../../../composables/useExperimentId';

type GenotypeKey = 'homoDom' | 'hetero' | 'homoRec';
const GENOTYPE_KEYS: GenotypeKey[] = ['homoDom', 'hetero', 'homoRec'];

const router = useRouter();
const route = useRoute();
const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));

const selectedTraitId = ref(mendelTraits.length > 0 ? mendelTraits[0].id : '');
const selectedTrait = computed<MendelTrait>(() =>
  mendelTraits.find((tr) => tr.id === selectedTraitId.value) ?? mendelTraits[0],
);
const p1 = ref<GenotypeKey>('hetero');
const p2 = ref<GenotypeKey>('hetero');

// تتبّع استكشاف الطالب لتغذية التقرير: الصفات المبحوثة + التهجينات المنفذة
const tracking = useBiologyTracking();
const { containerRef, getScreenshot } = useBiologyScreenshot();
watch(selectedTraitId, (id) => {
  const tr = mendelTraits.find((x) => x.id === id);
  if (tr) tracking.trackPart(tr.id, t(tr.nameKey));
}, { immediate: true });

function allelesFor(key: GenotypeKey, trait: MendelTrait): [string, string] {
  const D = trait.dominantAllele;
  const R = trait.recessiveAllele;
  if (key === 'homoDom') return [D, D];
  if (key === 'homoRec') return [R, R];
  return [D, R];
}

const p1Alleles = computed(() => allelesFor(p1.value, selectedTrait.value));
const p2Alleles = computed(() => allelesFor(p2.value, selectedTrait.value));

/** يدمج أليلَي الأمشاج مع تقديم أليل المهيمن أولاً (الصيغة القياسية Rr) */
function combine(a: string, b: string): string {
  return a === selectedTrait.value.dominantAllele ? a + b : b + a;
}

interface PunnettCell { genotype: string; dominant: boolean }
interface PunnettRow { rowAllele: string; cells: PunnettCell[] }

const cells = computed<PunnettRow[]>(() =>
  p2Alleles.value.map((rowAllele) => ({
    rowAllele,
    cells: p1Alleles.value.map((colAllele) => {
      const genotype = combine(colAllele, rowAllele);
      return { genotype, dominant: genotype.includes(selectedTrait.value.dominantAllele) };
    }),
  })),
);

const allCellGenotypes = computed(() => cells.value.flatMap((r) => r.cells.map((c) => c.genotype)));

/** عدّادات الأنماط الجينية بترتيب ثابت: مهيمن متماثل، متخالف، متنحي متماثل */
const genotypeCounts = computed(() => {
  const D = selectedTrait.value.dominantAllele;
  const R = selectedTrait.value.recessiveAllele;
  const counts = new Map<string, number>();
  for (const g of allCellGenotypes.value) counts.set(g, (counts.get(g) ?? 0) + 1);
  return [D + D, D + R, R + R]
    .map((genotype) => ({ genotype, count: counts.get(genotype) ?? 0 }))
    .filter((x) => x.count > 0);
});

const dominantCount = computed(() => cells.value.reduce((s, r) => s + r.cells.filter((c) => c.dominant).length, 0));
const recessiveCount = computed(() => 4 - dominantCount.value);
const phenotypeRatio = computed(() => `${dominantCount.value} : ${recessiveCount.value}`);

const hotspot = computed<HotspotState>(() => ({
  partId: selectedTrait.value.id,
  label: t(selectedTrait.value.nameKey),
  description: t(selectedTrait.value.descriptionKey),
  longDescription: t(selectedTrait.value.longDescriptionKey),
  facts: selectedTrait.value.factsKeys.map((k) => t(k)),
  position: new THREE.Vector3(0, 0, 0),
}));

const parentOptions = computed(() => {
  const D = selectedTrait.value.dominantAllele;
  const R = selectedTrait.value.recessiveAllele;
  return [
    { key: 'homoDom' as GenotypeKey, geno: D + D, labelKey: 'biology.mendel.homoDom' },
    { key: 'hetero' as GenotypeKey, geno: D + R, labelKey: 'biology.mendel.hetero' },
    { key: 'homoRec' as GenotypeKey, geno: R + R, labelKey: 'biology.mendel.homoRec' },
  ];
});

const goals = computed(() => [
  {
    id: 'completeCross',
    label: t('biology.goalCompleteCross'),
    completed: p1.value !== 'hetero' || p2.value !== 'hetero',
  },
]);

function selectTrait(id: string): void {
  selectedTraitId.value = id;
}

function randomCross(): void {
  const pick = (): GenotypeKey => GENOTYPE_KEYS[Math.floor(Math.random() * GENOTYPE_KEYS.length)];
  p1.value = pick();
  p2.value = pick();
}

// سجّل التهجين الحالي في التقرير (مثل: Rr × Rr)
watch([p1, p2, selectedTraitId], () => {
  const cross = `${p1Alleles.value.join('')} × ${p2Alleles.value.join('')}`;
  tracking.trackStage(cross);
}, { immediate: true });

const goBack = (): void => {
  router.push('/biology/genetics');
};

const { isFullscreen, toggleFullscreen } = useFullscreen();
const helpOpen = ref(false);
</script>

<template>
  <div class="experiment-page">
    <header class="experiment-header">
      <button class="back-button" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ t('biology.backToGeneticsSection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t('biology.punnettTitle') }}</h1>
        <p class="experiment-subtitle">{{ t('biology.punnettSubtitle') }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t('biology.punnettTitle')"
        :tracking="tracking"
        :get-screenshot="getScreenshot"
      />
      <button class="header-action" :title="t('biology.bioHelpTitle')" :aria-label="t('biology.bioHelpTitle')" @click="helpOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
      <button class="header-action" @click="toggleFullscreen">
        <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      </button>
    </header>

    <main class="experiment-body">
      <aside class="side-panel info-side">
        <div class="info-card">
          <InfoPanel :hotspot="hotspot" />
        </div>
        <BiologyGoals v-if="goals.length" :title="t('biology.goalsTitle')" :goals="goals" />
        <div class="legend-card">
          <h3 class="legend-title">{{ t('biology.mendel.legendTitle') }}</h3>
          <div class="legend-row">
            <span class="legend-allele dom">{{ selectedTrait.dominantAllele }}</span>
            <span class="legend-text">{{ t(selectedTrait.phenotypeDomKey) }}</span>
          </div>
          <div class="legend-row">
            <span class="legend-allele rec">{{ selectedTrait.recessiveAllele }}</span>
            <span class="legend-text">{{ t(selectedTrait.phenotypeRecKey) }}</span>
          </div>
        </div>
      </aside>

      <section ref="containerRef" class="canvas-section punnett-stage">
        <div class="punnett-board">
          <div class="punnett-parent-row">
            <span class="punnett-parent-label">{{ t('biology.mendel.parent1') }}</span>
            <span class="allele-chip">{{ p1Alleles[0] }}</span>
            <span class="allele-chip">{{ p1Alleles[1] }}</span>
          </div>
          <div class="punnett-grid-wrap">
            <div class="punnett-parent-col">
              <span class="punnett-parent-label">{{ t('biology.mendel.parent2') }}</span>
              <span class="allele-chip">{{ p2Alleles[0] }}</span>
              <span class="allele-chip">{{ p2Alleles[1] }}</span>
            </div>
            <div class="punnett-grid">
              <div class="punnett-head-cell punnett-corner" aria-hidden="true">×</div>
              <div v-for="a in p1Alleles" :key="'h' + a" class="punnett-head-cell">{{ a }}</div>
              <template v-for="(row, ri) in cells" :key="ri">
                <div class="punnett-head-cell">{{ row.rowAllele }}</div>
                <div
                  v-for="(cell, ci) in row.cells"
                  :key="ri + '-' + ci"
                  class="punnett-cell"
                  :class="cell.dominant ? 'dom' : 'rec'"
                >
                  {{ cell.genotype }}
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="ratio-panel">
          <div class="ratio-block">
            <h4 class="ratio-title">{{ t('biology.mendel.ratioGenotype') }}</h4>
            <div class="ratio-chips">
              <span v-for="g in genotypeCounts" :key="g.genotype" class="geno-chip">
                {{ g.genotype }} · {{ g.count }}/4
              </span>
            </div>
          </div>
          <div class="ratio-block">
            <h4 class="ratio-title">{{ t('biology.mendel.ratioPhenotype') }}</h4>
            <div class="pheno-bar">
              <div class="pheno-fill dom" :style="{ width: (dominantCount / 4) * 100 + '%' }" />
              <div class="pheno-fill rec" :style="{ width: (recessiveCount / 4) * 100 + '%' }" />
            </div>
            <div class="pheno-labels">
              <span class="pheno-dom">{{ t(selectedTrait.phenotypeDomKey) }} — {{ dominantCount }}/4</span>
              <span class="ratio-big">{{ phenotypeRatio }}</span>
              <span class="pheno-rec">{{ t(selectedTrait.phenotypeRecKey) }} — {{ recessiveCount }}/4</span>
            </div>
          </div>
        </div>

        <div class="floating-toolbar">
          <button
            class="tool-btn"
            :title="t('biology.mendel.randomCross')"
            @click.stop="randomCross"
          >
            🎲
          </button>
        </div>
      </section>

      <aside class="side-panel parts-side">
        <div class="parts-card">
          <h2 class="panel-title">{{ t('biology.mendel.traitLabel') }}</h2>
          <ul class="parts-list">
            <li
              v-for="tr in mendelTraits"
              :key="tr.id"
              class="part-item"
              :class="{ active: tr.id === selectedTraitId }"
              @click="selectTrait(tr.id)"
            >
              <span class="part-dot" />
              <span class="part-icon">{{ tr.icon }}</span>
              {{ t(tr.nameKey) }}
            </li>
          </ul>

          <div class="parent-controls">
            <h3 class="parent-title">{{ t('biology.mendel.parent1') }}</h3>
            <div class="parent-options">
              <button
                v-for="opt in parentOptions"
                :key="'p1' + opt.key"
                class="parent-option"
                :class="{ active: p1 === opt.key }"
                @click="p1 = opt.key"
              >
                <strong>{{ opt.geno }}</strong>
                <small>{{ t(opt.labelKey) }}</small>
              </button>
            </div>

            <h3 class="parent-title">{{ t('biology.mendel.parent2') }}</h3>
            <div class="parent-options">
              <button
                v-for="opt in parentOptions"
                :key="'p2' + opt.key"
                class="parent-option"
                :class="{ active: p2 === opt.key }"
                @click="p2 = opt.key"
              >
                <strong>{{ opt.geno }}</strong>
                <small>{{ t(opt.labelKey) }}</small>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: experimentId ?? '', titleKey: 'biology.punnettTitle', subtitleKey: 'biology.punnettSubtitle', parts: mendelTraits.map((tr) => ({ id: tr.id, nameKey: tr.nameKey })) }"
    @close="helpOpen = false"
  />
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
<style scoped>
.punnett-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  overflow-y: auto;
  padding: 1rem;
}

.punnett-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.punnett-parent-row,
.punnett-parent-col {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.punnett-parent-row { justify-content: center; }
.punnett-parent-col { flex-direction: column; }

.punnett-parent-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.allele-chip {
  min-width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgba(74, 222, 128, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 0 0.45rem;
}

.punnett-grid-wrap {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.punnett-grid {
  display: grid;
  grid-template-columns: 64px repeat(2, minmax(96px, 1fr));
  grid-auto-rows: minmax(64px, auto);
  gap: 6px;
}

.punnett-head-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  color: #94a3b8;
}

.punnett-corner { color: #64748b; }

.punnett-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
  border-radius: 0.65rem;
  border: 1px solid #334155;
  transition: transform 0.15s ease;
}

.punnett-cell.dom {
  background: rgba(74, 222, 128, 0.14);
  border-color: rgba(74, 222, 128, 0.45);
  color: #4ade80;
}

.punnett-cell.rec {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.45);
  color: #fbbf24;
}

.punnett-cell:hover { transform: scale(1.05); }

.ratio-panel {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
}

.ratio-block { display: flex; flex-direction: column; gap: 0.45rem; }

.ratio-title {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.ratio-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.geno-chip {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #e2e8f0;
}

.pheno-bar {
  display: flex;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
}

.pheno-fill.dom { background: #4ade80; transition: width 0.25s ease; }
.pheno-fill.rec { background: #f59e0b; transition: width 0.25s ease; }

.pheno-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #cbd5e1;
  flex-wrap: wrap;
}

.pheno-dom { color: #4ade80; font-weight: 600; }
.pheno-rec { color: #fbbf24; font-weight: 600; }
.ratio-big { font-size: 1.15rem; font-weight: 800; color: #e2e8f0; }

.legend-card {
  margin-top: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-title {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
}

.legend-row { display: flex; align-items: center; gap: 0.55rem; }

.legend-allele {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.45rem;
  font-weight: 800;
  flex-shrink: 0;
}

.legend-allele.dom { background: rgba(74, 222, 128, 0.14); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); }
.legend-allele.rec { background: rgba(245, 158, 11, 0.14); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }

.legend-text { font-size: 0.85rem; color: #cbd5e1; }

.part-icon { margin-inline-end: 0.35rem; }

.parent-controls {
  margin-top: 0.9rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(51, 65, 85, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parent-title {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
}

.parent-options { display: flex; flex-direction: column; gap: 0.35rem; }

.parent-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.85rem;
}

.parent-option:hover { border-color: #475569; background: rgba(51, 65, 85, 0.85); }

.parent-option.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.5);
  color: #4ade80;
}

.parent-option strong { font-size: 1rem; }
.parent-option small { color: #94a3b8; font-size: 0.72rem; }
.parent-option.active small { color: rgba(74, 222, 128, 0.8); }

@media (max-width: 1100px) {
  .experiment-body { grid-template-columns: 1fr; }
  .punnett-grid { grid-template-columns: 48px repeat(2, minmax(80px, 1fr)); }
}
</style>
