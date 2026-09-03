<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, computed } from 'vue';
import type { Chemical, ChemicalCategory } from '../../../composables/chemistry/useChemistryLab';
import { chemicals, selectedChemical, pendingChemicalFill, pendingSolidSelect, spatulaSelectedSolid } from '../../../composables/chemistry/useChemistryLab';

import { useChemicalLocale } from '../../../composables/chemistry/useChemicalLocale';
import ChemicalCard from './ChemicalCard.vue';





const { getName, getDesc } = useChemicalLocale();

const emit = defineEmits<{ chemicalClick: [chem: Chemical] }>();

const search = ref('');
const activeCategory = ref<ChemicalCategory | 'all'>('all');

function getCategoryLabel(cat: ChemicalCategory): string {
  const map: Record<ChemicalCategory, string> = {
    acid: t('chemistryShelf.acid'),
    base: t('chemistryShelf.base'),
    salt: t('chemistryShelf.salt'),
    solvent: t('chemistryShelf.solvent'),
    indicator: t('chemistryShelf.indicator'),
    solid: t('chemistryShelf.solid'),
    gas: t('chemistryShelf.gas'),
  };
  return map[cat];
}

const categories = computed(() => (['acid', 'base', 'salt', 'solvent', 'indicator', 'solid', 'gas'] as ChemicalCategory[]).map(key => [key, getCategoryLabel(key)] as [ChemicalCategory, string]));

const filteredChemicals = computed(() => {
  let list = chemicals;
  if (activeCategory.value !== 'all') {
    list = list.filter(c => c.category === activeCategory.value);
  }
  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter(c =>
      getName(c.id).toLowerCase().includes(q) ||
      c.formula.toLowerCase().includes(q) ||
      c.id.includes(q)
    );
  }
  return list;
});

function onCardClick(chem: Chemical) {
  // If pending solid select (from spatula), handle it
  if (pendingSolidSelect.value && chem.category === 'solid') {
    spatulaSelectedSolid.value = {
      chemicalId: chem.id,
      color: chem.color,
      name: getName(chem.id),
    };
    pendingSolidSelect.value = null;
    return;
  }
  Object.assign(selectedChemical, chem);
  emit('chemicalClick', chem);
}
</script>

<template>
  <div class="shelf-panel">
    <!-- Search -->
    <div class="shelf-search">
      <input
        v-model="search"
        type="text"
        :placeholder="t('chemistryShelf.searchPlaceholder')"
        class="search-input"
      />
    </div>

    <!-- Pending fill banner -->
    <div v-if="pendingChemicalFill" class="pending-banner">
      <span>{{ t('chemistryShelf.selectSolutionFromTable') }}</span>
      <button class="cancel-btn" @click="pendingChemicalFill = null">{{ t('chemistryShelf.cancel') }}</button>
    </div>

    <!-- Pending solid select banner (from spatula) -->
    <div v-if="pendingSolidSelect" class="pending-banner">
      <span>{{ t('chemistryShelf.selectSolidFromTable') }}</span>
      <button class="cancel-btn" @click="pendingSolidSelect = null">{{ t('chemistryShelf.cancel') }}</button>
    </div>

    <!-- Category filter -->
    <div class="category-tabs">
      <button
        class="cat-btn"
        :class="{ active: activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >
        {{ t('chemistryShelf.all') }}
      </button>
      <button
        v-for="[key, label] in categories"
        :key="key"
        class="cat-btn"
        :class="{ active: activeCategory === key }"
        @click="activeCategory = key"
      >
        {{ label }}
      </button>
    </div>

    <!-- Grid -->
    <div class="shelf-grid">
      <ChemicalCard
        v-for="chem in filteredChemicals"
        :key="chem.id"
        :chem="chem"
        :selected="selectedChemical.id === chem.id"
        :clickable="!!pendingChemicalFill && (chem.category === 'acid' || chem.category === 'base' || chem.category === 'solvent' || chem.category === 'salt' || chem.category === 'indicator' || chem.category === 'gas') || (!!pendingSolidSelect && chem.category === 'solid')"
        @click="onCardClick(chem)"
      />
    </div>

    <!-- Selected detail -->
    <div v-if="selectedChemical.id" class="selected-detail">
      <div class="detail-row">
        <b>{{ getName(selectedChemical.id) }}</b>
        <span class="detail-formula">{{ selectedChemical.formula }}</span>
      </div>
      <div class="detail-row">
        <span>{{ t('chemistryShelf.category') }}</span>
        <span>{{ (selectedChemical as Chemical).category ? getCategoryLabel((selectedChemical as Chemical).category) : '' }}</span>
      </div>
      <div class="detail-row">
        <span>{{ t('chemistryShelf.state') }}</span>
        <span class="state-tag">{{ selectedChemical.physicalState === 'liquid' ? t('chemistryShelf.liquid') : selectedChemical.physicalState === 'solid' ? t('chemistryShelf.solidState') : t('chemistryShelf.gasState') }}</span>
      </div>
      <div v-if="selectedChemical.concentration !== undefined" class="detail-row">
        <span>{{ t('chemistryShelf.concentration') }}</span>
        <span>{{ selectedChemical.concentration }} M</span>
      </div>
      <div v-if="selectedChemical.ph !== undefined" class="detail-row">
        <span>pH</span>
        <span>{{ selectedChemical.ph }}</span>
      </div>
      <div v-if="selectedChemical.density !== undefined" class="detail-row">
        <span>{{ t('chemistryShelf.density') }}</span>
        <span>{{ selectedChemical.density }} g/mL</span>
      </div>
      <div v-if="selectedChemical.boilingPoint !== undefined" class="detail-row">
        <span>{{ t('chemistryShelf.boilingPoint') }}</span>
        <span>{{ selectedChemical.boilingPoint }}°C</span>
      </div>
      <div v-if="selectedChemical.description" class="detail-desc">
        {{ getDesc(selectedChemical.id) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.shelf-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem;
}
.shelf-search {
  position: sticky;
  top: 0;
  z-index: 5;
}
.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-family: inherit;
  background: #fff;
  color: #334155;
  outline: none;
}
.search-input:focus { border-color: #10b981; }
.pending-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
  border-radius: 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #065f46;
}
.cancel-btn {
  background: #fff;
  border: 1px solid #6ee7b7;
  border-radius: 0.35rem;
  padding: 0.15rem 0.4rem;
  font-size: 0.65rem;
  cursor: pointer;
  color: #065f46;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.cat-btn {
  padding: 0.35rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.4rem;
  background: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;
}
.cat-btn:hover { background: #f1f5f9; }
.cat-btn.active {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}
.shelf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.selected-detail {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.72rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-row span:first-child { color: #64748b; }
.detail-row span:last-child, .detail-row b { color: #334155; font-weight: 700; }
.detail-formula {
  font-family: monospace;
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 400;
}
.state-tag {
  font-size: 0.6rem;
  padding: 0.1rem 0.35rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
  color: #475569;
}
.detail-desc {
  font-size: 0.65rem;
  color: #475569;
  background: #f8fafc;
  padding: 0.35rem 0.5rem;
  border-radius: 0.3rem;
  margin-top: 0.2rem;
}
</style>
