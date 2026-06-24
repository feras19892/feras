<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Chemical, ChemicalCategory } from '../../../composables/chemistry/useChemistryLab';
import { chemicals, selectedChemical, pendingChemicalFill } from '../../../composables/chemistry/useChemistryLab';
import ChemicalCard from './ChemicalCard.vue';

const emit = defineEmits<{ chemicalClick: [chem: Chemical] }>();

const search = ref('');
const activeCategory = ref<ChemicalCategory | 'all'>('all');

const categoryLabels: Record<ChemicalCategory, string> = {
  acid: '● أحماض',
  base: '● قواعد',
  salt: '● أملاح',
  solvent: '● مذيبات',
  indicator: '● كواشف',
  solid: '● مواد صلبة',
  gas: '● غازات',
};

const categories = Object.entries(categoryLabels) as [ChemicalCategory, string][];

const filteredChemicals = computed(() => {
  let list = chemicals;
  if (activeCategory.value !== 'all') {
    list = list.filter(c => c.category === activeCategory.value);
  }
  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter(c =>
      c.nameAr.includes(q) ||
      c.formula.toLowerCase().includes(q) ||
      c.id.includes(q)
    );
  }
  return list;
});

function onCardClick(chem: Chemical) {
  selectedChemical.id = chem.id;
  selectedChemical.nameAr = chem.nameAr;
  selectedChemical.color = chem.color;
  selectedChemical.opacity = chem.opacity;
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
        placeholder="🔍 ابحث باسم أو صيغة..."
        class="search-input"
      />
    </div>

    <!-- Pending fill banner -->
    <div v-if="pendingChemicalFill" class="pending-banner">
      <span>⚡ اختر محلول للإضافة من الجدول</span>
      <button class="cancel-btn" @click="pendingChemicalFill = null">❌ إلغاء</button>
    </div>

    <!-- Category filter -->
    <div class="category-tabs">
      <button
        class="cat-btn"
        :class="{ active: activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >
        الكل
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
        :clickable="!!pendingChemicalFill && (chem.category === 'acid' || chem.category === 'base' || chem.category === 'solvent' || chem.category === 'salt' || chem.category === 'indicator')"
        @click="onCardClick(chem)"
      />
    </div>

    <!-- Selected detail -->
    <div v-if="selectedChemical.id" class="selected-detail">
      <div class="detail-row">
        <b>{{ selectedChemical.nameAr }}</b>
        <span class="detail-formula">{{ selectedChemical.formula }}</span>
      </div>
      <div class="detail-row">
        <span>الفئة</span>
        <span>{{ (selectedChemical as Chemical).category ? categoryLabels[(selectedChemical as Chemical).category] : '' }}</span>
      </div>
      <div class="detail-row">
        <span>الحالة</span>
        <span class="state-tag">{{ selectedChemical.physicalState === 'liquid' ? 'سائل' : selectedChemical.physicalState === 'solid' ? 'صلب' : 'غاز' }}</span>
      </div>
      <div v-if="selectedChemical.concentration !== undefined" class="detail-row">
        <span>التركيز</span>
        <span>{{ selectedChemical.concentration }} M</span>
      </div>
      <div v-if="selectedChemical.ph !== undefined" class="detail-row">
        <span>pH</span>
        <span>{{ selectedChemical.ph }}</span>
      </div>
      <div v-if="selectedChemical.density !== undefined" class="detail-row">
        <span>الكثافة</span>
        <span>{{ selectedChemical.density }} g/mL</span>
      </div>
      <div v-if="selectedChemical.boilingPoint !== undefined" class="detail-row">
        <span>ن.غليان</span>
        <span>{{ selectedChemical.boilingPoint }}°C</span>
      </div>
      <div v-if="selectedChemical.description" class="detail-desc">
        {{ selectedChemical.description }}
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
