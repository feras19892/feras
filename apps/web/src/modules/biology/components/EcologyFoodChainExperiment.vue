<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
const { t } = useI18n();
import { computed, ref, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

import { foodChains } from '../../../services/ecology-data';
import type { ChainOrganism, FoodChain } from '../../../services/ecology-data';
import { organismDetails } from '../../../services/ecology-organism-details';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import { useBiologyScreenshot } from '../../../composables/biology/useBiologyScreenshot';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { useRoute } from 'vue-router';
import { resolveExperimentId } from '../../../composables/useExperimentId';
import { useFullscreen } from '../../../composables/shared/useFullscreen';

const router = useRouter();
const route = useRoute();
const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));

const tracking = useBiologyTracking();
const { containerRef, getScreenshot } = useBiologyScreenshot();

const selectedChainId = ref(foodChains[0].id);
const selectedChain = computed<FoodChain>(() => foodChains.find((c) => c.id === selectedChainId.value) ?? foodChains[0]);
const chainDropdownOpen = ref(false);

function toggleChainDropdown(): void {
  chainDropdownOpen.value = !chainDropdownOpen.value;
}

function selectChain(id: string): void {
  selectedChainId.value = id;
  chainDropdownOpen.value = false;
}

/** الخانات المملوءة بالترتيب */
const slots = ref<(ChainOrganism | null)[]>([]);
const wrongId = ref<string | null>(null);
const shuffleSeed = ref(1);
let wrongTimer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (wrongTimer) clearTimeout(wrongTimer);
});

/** الكائن المعروض حالياً في لوحة المعلومات */
const selectedOrgId = ref<string | null>(null);
/** السلاسل التي أكملها الطالب */
const completedChains = ref<Set<string>>(new Set());

function resetChain(): void {
  slots.value = selectedChain.value.organisms.map(() => null);
  shuffleSeed.value++;
  wrongId.value = null;
}

watch(selectedChainId, () => {
  tracking.trackPart(`chain-${selectedChainId.value}`, t(selectedChain.value.nameKey));
  selectedOrgId.value = null;
  resetChain();
}, { immediate: true });

/** خربشة ثابتة حسب البذرة — تتجدد عند إعادة الترتيب */
function seededHash(id: string): number {
  let h = shuffleSeed.value * 7919;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return h;
}

const placedIds = computed(() => new Set(slots.value.filter(Boolean).map((o) => (o as ChainOrganism).id)));

const pool = computed(() => {
  const remaining = selectedChain.value.organisms.filter((o) => !placedIds.value.has(o.id));
  return [...remaining].sort((a, b) => seededHash(a.id) - seededHash(b.id));
});

const placedCount = computed(() => slots.value.filter(Boolean).length);
const isComplete = computed(() => placedCount.value === selectedChain.value.organisms.length);

const goals = computed(() => [
  {
    id: 'completeChain',
    label: t('biology.goalCompleteChain'),
    completed: isComplete.value,
  },
  {
    id: 'completeAllChains',
    label: t('biology.goalCompleteAllChains'),
    completed: completedChains.value.size >= foodChains.length,
  },
]);

function onPick(org: ChainOrganism): void {
  selectedOrgId.value = org.id;
  if (isComplete.value) return;
  if (org.level === placedCount.value) {
    slots.value[placedCount.value] = org;
    tracking.trackPart(`${selectedChainId.value}-${org.id}`, t(org.nameKey));
    if (placedCount.value === selectedChain.value.organisms.length) {
      tracking.trackStage(`chain-complete-${selectedChainId.value}`);
      completedChains.value = new Set(completedChains.value).add(selectedChainId.value);
    }
  } else {
    wrongId.value = org.id;
    if (wrongTimer) clearTimeout(wrongTimer);
    wrongTimer = setTimeout(() => { wrongId.value = null; wrongTimer = null; }, 450);
  }
}

function onSlotClick(org: ChainOrganism): void {
  selectedOrgId.value = org.id;
}

const selectedOrg = computed<ChainOrganism | null>(() =>
  selectedChain.value.organisms.find((o) => o.id === selectedOrgId.value) ?? null,
);

const hotspot = computed<HotspotState | null>(() => {
  const org = selectedOrg.value;
  const detail = org ? organismDetails[org.id] : null;
  if (!org || !detail) return null;
  return {
    partId: org.id,
    label: `${org.icon} ${t(org.nameKey)}`,
    description: `${t(org.roleKey)} — ${t(detail.infoKey)}`,
    longDescription: t(detail.longInfoKey),
    facts: detail.factsKeys.map((key) => t(key)),
    position: new THREE.Vector3(0, 0, 0),
  };
});

/** الأشرطة المملوءة لهرم الطاقة */
const energyBars = computed(() =>
  slots.value
    .map((o) => o)
    .filter((o): o is ChainOrganism => !!o)
    .map((o) => ({ id: o.id, icon: o.icon, name: t(o.nameKey), energy: o.energy })),
);

const goBack = (): void => {
  void router.push('/biology/ecology');
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
        {{ t('biology.backToEcologySection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t('biology.foodChainTitle') }}</h1>
        <p class="experiment-subtitle">{{ t('biology.foodChainSubtitle') }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t('biology.foodChainTitle')"
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
          <InfoPanel :hotspot="hotspot">
            <template #empty>
              <div class="empty-card">
                <div class="empty-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <p>{{ t('biology.foodChainInfoHint') }}</p>
              </div>
            </template>
          </InfoPanel>
        </div>
        <BiologyGoals v-if="goals.length" :title="t('biology.goalsTitle')" :goals="goals" />
      </aside>

      <section ref="containerRef" class="canvas-section chain-stage">
        <div class="chain-slots">
          <div
            v-for="(org, i) in slots"
            :key="i"
            class="chain-slot"
            :class="{ filled: !!org }"
          >
            <div
              v-if="org"
              class="slot-filled"
              :class="{ exploring: selectedOrgId === org.id }"
              role="button"
              tabindex="0"
              :aria-label="t(org.nameKey)"
              @click="onSlotClick(org)"
              @keydown.enter="onSlotClick(org)"
              @keydown.space.prevent="onSlotClick(org)"
            >
              <span class="slot-icon">{{ org.icon }}</span>
              <span class="slot-name">{{ t(org.nameKey) }}</span>
              <span class="slot-role">{{ t(org.roleKey) }}</span>
            </div>
            <div v-else class="slot-empty">
              <span class="slot-level">{{ i + 1 }}</span>
            </div>
            <svg v-if="i < slots.length - 1" class="slot-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div v-if="isComplete" class="chain-complete">
          ✅ {{ t('biology.foodChainComplete') }}
        </div>

        <div class="energy-pyramid">
          <h3 class="pyramid-title">{{ t('biology.foodChainEnergyTitle') }}</h3>
          <div v-for="bar in energyBars" :key="bar.id" class="pyramid-row">
            <span class="pyramid-label">{{ bar.icon }} {{ bar.name }}</span>
            <div class="pyramid-track">
              <div class="pyramid-fill" :style="{ width: Math.max(4, bar.energy) + '%' }" />
            </div>
            <span class="pyramid-value">{{ bar.energy }}%</span>
          </div>
        </div>
      </section>

      <aside class="side-panel parts-side">
        <div class="parts-card">
          <h2 class="panel-title">{{ t('biology.foodChainPanelLabel') }}</h2>
          <div class="chain-dropdown">
            <button
              type="button"
              class="chain-dropdown-toggle"
              :aria-label="t(selectedChain.nameKey)"
              @click="toggleChainDropdown"
            >
              <span class="chain-dropdown-icon">{{ selectedChain.icon }}</span>
              <span class="chain-dropdown-name">{{ t(selectedChain.nameKey) }}</span>
              <span class="chain-dropdown-chevron" aria-hidden="true">{{ chainDropdownOpen ? '▲' : '▼' }}</span>
            </button>
            <div
              v-if="chainDropdownOpen"
              class="chain-dropdown-list"
              role="listbox"
              :aria-label="t('biology.foodChainPanelLabel')"
            >
              <button
                v-for="c in foodChains"
                :key="c.id"
                type="button"
                class="chain-dropdown-item"
                :class="{ active: c.id === selectedChainId }"
                :aria-label="t(c.nameKey)"
                role="option"
                :aria-selected="c.id === selectedChainId"
                @click="selectChain(c.id)"
              >
                <span class="chain-dropdown-item-icon">{{ c.icon }}</span>
                <span class="chain-dropdown-item-name">{{ t(c.nameKey) }}</span>
              </button>
            </div>
          </div>
          <ul class="parts-list pool-list">
            <li
              v-for="org in pool"
              :key="org.id"
              class="part-item pool-card"
              :class="{ shake: wrongId === org.id }"
              @click="onPick(org)"
            >
              <span class="pool-icon">{{ org.icon }}</span>
              <span class="pool-body">
                <span class="pool-name">{{ t(org.nameKey) }}</span>
                <span class="pool-role">{{ t(org.roleKey) }}</span>
              </span>
            </li>
          </ul>
          <button class="chain-reset" @click="resetChain">🔄 {{ t('biology.foodChainReset') }}</button>
        </div>
      </aside>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: 'food-chain', titleKey: 'biology.foodChainTitle', subtitleKey: 'biology.foodChainSubtitle' }"
    @close="helpOpen = false"
  />
  </div>
</template>
<style scoped src="./glb-experiment.css"></style>
<style scoped>
.chain-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  overflow-y: auto;
  padding: 1rem;
}

.chain-slots {
  display: flex;
  align-items: stretch;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}

.chain-slot {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.chain-slot.filled {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.45);
  border-radius: 0.75rem;
  padding: 0.5rem 0.7rem;
  min-width: 108px;
}

.slot-filled.exploring {
  background: rgba(56, 189, 248, 0.16);
  border-color: rgba(56, 189, 248, 0.6);
  cursor: pointer;
}

.slot-filled {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.slot-icon { font-size: 1.6rem; }
.slot-name { font-size: 0.8rem; font-weight: 700; color: #4ade80; }
.slot-role { font-size: 0.68rem; color: #94a3b8; }

.slot-empty {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #475569;
  border-radius: 0.75rem;
  color: #64748b;
  font-size: 1.3rem;
  font-weight: 800;
}

.slot-arrow { color: #475569; flex-shrink: 0; }

.chain-complete {
  background: rgba(74, 222, 128, 0.14);
  border: 1px solid rgba(74, 222, 128, 0.45);
  color: #4ade80;
  font-weight: 700;
  padding: 0.55rem 1.1rem;
  border-radius: 0.6rem;
}

.energy-pyramid {
  width: 100%;
  max-width: 540px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pyramid-title {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.pyramid-row {
  display: grid;
  grid-template-columns: 130px 1fr 58px;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.pyramid-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.6);
  overflow: hidden;
}

.pyramid-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #facc15, #f97316);
  transition: width 0.3s ease;
}

.pyramid-value { text-align: center; font-weight: 700; color: #fbbf24; }

.chain-dropdown {
  position: relative;
  margin-bottom: 0.6rem;
}

.chain-dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #cbd5e1;
  padding: 0.55rem 0.7rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.chain-dropdown-toggle:hover {
  background: rgba(51, 65, 85, 0.85);
}

.chain-dropdown-icon { font-size: 1.2rem; }

.chain-dropdown-name {
  flex: 1;
  text-align: start;
  font-weight: 700;
  color: #e2e8f0;
}

.chain-dropdown-chevron {
  color: #94a3b8;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.chain-dropdown-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 220px;
  overflow-y: auto;
  margin-top: 0.35rem;
  padding: 0.4rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.chain-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.4rem;
  color: #cbd5e1;
  padding: 0.45rem 0.55rem;
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.15s ease;
  text-align: start;
}

.chain-dropdown-item:hover {
  background: rgba(51, 65, 85, 0.6);
}

.chain-dropdown-item.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.5);
  color: #4ade80;
}

.chain-dropdown-item-icon { font-size: 1.1rem; }

.chain-dropdown-item-name { font-weight: 600; }

.pool-list { display: flex; flex-direction: column; gap: 0.4rem; }

.pool-card { cursor: pointer; }

.pool-card:hover { background: rgba(51, 65, 85, 0.6); }

.pool-icon { font-size: 1.3rem; margin-inline-end: 0.4rem; }

.pool-body { display: flex; flex-direction: column; }

.pool-name { font-weight: 700; color: #e2e8f0; font-size: 0.88rem; }
.pool-role { font-size: 0.7rem; color: #94a3b8; }

.pool-card.shake {
  animation: fc-shake 0.4s ease;
  border-color: rgba(239, 68, 68, 0.6);
}

@keyframes fc-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.chain-reset {
  margin-top: 0.7rem;
  width: 100%;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 0.45rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.chain-reset:hover { background: rgba(51, 65, 85, 0.85); }

@media (max-width: 1100px) {
  .experiment-body { grid-template-columns: 1fr; }
}
</style>
