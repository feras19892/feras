<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { shallowRef } from 'vue'

const deleted = shallowRef(false)
function restore() { deleted.value = false }
</script>

<template>
  <section v-if="!deleted" class="deletable-section">
    <button class="delete-section-btn" @click="deleted = true" :title="t('experiments.removeSection')">✕</button>
    <slot />
  </section>
  <div v-else class="restored-section" @click="restore" :title="t('experiments.restoreSection')">
    <span>➕ {{ t('experiments.restoreDeletedSection') }}</span>
  </div>
</template>

<style scoped>
.deletable-section { position: relative; }
.delete-section-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 5;
  background: #3a1f1f;
  border: 1px solid #5c2a2a;
  color: #ff6b6b;
  border-radius: 4px;
  padding: .15rem .4rem;
  font-size: .7rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s;
}
.deletable-section:hover .delete-section-btn { opacity: 1; }
.delete-section-btn:hover { background: #5c2a2a; color: #fff; }
.restored-section {
  background: #1a2634;
  border: 1px dashed #2D3645;
  border-radius: 8px;
  padding: .5rem;
  text-align: center;
  color: #5B8DB8;
  font-size: .75rem;
  cursor: pointer;
  transition: background .2s;
}
.restored-section:hover { background: #1e3344; }
@media print {
  .delete-section-btn { display: none !important; }
  .restored-section { display: none !important; }
}
</style>
