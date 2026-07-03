<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();

const notes = ref('');

function openDataTable() {
  window.dispatchEvent(new CustomEvent('open-data-table'));
}
</script>

<template>
  <div class="notes-panel">
    <h3>{{ t('chemistryLab.notesPanel') }}</h3>
    <textarea
      v-model="notes"
      :placeholder="t('chemistryLab.notesPlaceholder')"
      rows="4"
    />
    <button class="data-table-btn" @click="openDataTable">
      {{ t('chemistryLab.openSmartTable') }}
    </button>
  </div>
</template>

<style scoped>
.notes-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
}
.notes-panel h3 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #334155;
}
textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.6rem;
  font-size: 0.8rem;
  font-family: inherit;
  color: #334155;
  background: #f8fafc;
  line-height: 1.6;
}
textarea:focus {
  outline: none;
  border-color: #10b981;
  background: #ffffff;
}
.data-table-btn {
  width: 100%;
  margin-top: 0.6rem;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.data-table-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
