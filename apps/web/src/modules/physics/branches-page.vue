<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { useRouter } from 'vue-router';
import { branches } from './catalog';

const router = useRouter();

function goToBranch(id: string) {
  const branch = branches.find(b => b.id === id)
  if (branch) {
    const enabled = branch.experiments.filter(e => e.enabled)
    if (enabled.length === 1) {
      router.push(`/physics/${id}/${enabled[0].id}`)
    } else {
      router.push(`/physics/${id}`)
    }
  }
}

function branchNameKey(id: string): string {
  const map: Record<string, string> = {
    mechanics: 'experiments.branchMechanics',
    waves: 'experiments.branchWaves',
    heat: 'experiments.branchHeat',
    electricity: 'experiments.branchElectricity',
    electromagnetism: 'experiments.branchElectromagnetism',
  };
  return map[id] || id;
}

function branchDescKey(id: string): string {
  const map: Record<string, string> = {
    mechanics: 'experiments.branchMechanicsDesc',
    waves: 'experiments.branchWavesDesc',
    heat: 'experiments.branchHeatDesc',
    electricity: 'experiments.branchElectricityDesc',
    electromagnetism: 'experiments.branchElectromagnetismDesc',
  };
  return map[id] || id;
}
</script>

<template>
  <div class="branches-page">
    <header class="page-header">
      <h1>🔬 {{ t('experiments.physicsBranches') }}</h1>
      <p>{{ t('experiments.chooseBranchToStart') }}</p>
    </header>
    <div class="grid">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="card"
        :style="{ borderColor: branch.color }"
        @click="goToBranch(branch.id)"
      >
        <div class="icon" :style="{ background: branch.color }">
          {{ branch.icon }}
        </div>
        <h3>{{ t(branchNameKey(branch.id)) }}</h3>
        <p class="desc">{{ t(branchDescKey(branch.id)) }}</p>
        <div class="meta">
          <span class="badge">{{ branch.experiments.filter(e => e.enabled).length }} {{ branch.experiments.filter(e => e.enabled).length === 1 ? t('experiments.experimentsCount') : t('experiments.experimentsCountPlural') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.branches-page {
  min-height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
  padding: 2rem 1rem;
}
.page-header { text-align: center; margin-bottom: 2rem; }
.page-header h1 { color: #67e8f9; margin: 0 0 0.5rem; }
.page-header p { color: #94a3b8; margin: 0; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  border-left: 4px solid;
}
.card:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,0.07);
}
.icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}
.card h3 { margin: 0 0 0.5rem; font-size: 1.1rem; }
.desc { color: #94a3b8; font-size: 0.85rem; margin: 0 0 0.75rem; line-height: 1.5; }
.meta { display: flex; gap: 0.5rem; }
.badge {
  background: rgba(255,255,255,0.08);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #cbd5e1;
}
</style>
