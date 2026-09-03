<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted, computed } from 'vue';
import { fetchJson } from '../../services/http';
import type { School } from '../../services/school.service';
const props = defineProps<{
  school: School | null;
  dateLocaleStr: string;
}>();
const capacityForm = ref({ requested_max_students: null as number | null, requested_max_teachers: null as number | null, reason: '' });
const capacitySaving = ref(false);
const capacityMsg = ref('');

interface CapacityRequest {
  id: number;
  requested_max_students: number | null;
  requested_max_teachers: number | null;
  reason: string;
  status: string;
  created_at: string;
}
const capacityRequests = ref<CapacityRequest[]>([]);

const pendingCapacity = computed(() => capacityRequests.value.filter(r => r.status === 'pending').length);

async function submitCapacityRequest() {
  if (!capacityForm.value.reason.trim()) return;
  capacitySaving.value = true;
  capacityMsg.value = '';
  try {
    const res = await fetchJson<{ success: boolean }>('/api/school/capacity-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capacityForm.value),
    });
    if (res.success) {
      capacityMsg.value = t('school.capacitySuccess');
      capacityForm.value = { requested_max_students: null, requested_max_teachers: null, reason: '' };
      await loadCapacityRequests();
    }
  } catch (err) {
    capacityMsg.value = err instanceof Error ? err.message : t('school.capacityFailed');
  }
  capacitySaving.value = false;
}

async function loadCapacityRequests() {
  try {
    const res = await fetchJson<{ success: boolean; requests: CapacityRequest[] }>('/api/school/capacity-requests');
    if (res.success) capacityRequests.value = res.requests;
  } catch { /* ignore */ }
}

onMounted(loadCapacityRequests);
</script>

<template>
  <div class="capacity-request-section">
    <div class="cap-form">
      <input
        v-model.number="capacityForm.requested_max_students"
        type="number"
        :placeholder="t('school.capacityStudentsPlaceholder', { max: school?.max_students || 0 })"
        class="cap-input"
      />
      <input
        v-model.number="capacityForm.requested_max_teachers"
        type="number"
        :placeholder="t('school.capacityTeachersPlaceholder', { max: school?.max_teachers || 0 })"
        class="cap-input"
      />
      <input
        v-model="capacityForm.reason"
        :placeholder="t('school.capacityReasonPlaceholder')"
        class="cap-input reason"
      />
      <button
        @click="submitCapacityRequest"
        :disabled="capacitySaving || !capacityForm.reason.trim()"
        class="cap-submit"
      >
        {{ capacitySaving ? t('school.capacitySaving') : t('school.capacitySubmit') }}
      </button>
    </div>
    <div v-if="capacityMsg" class="cap-msg">{{ capacityMsg }}</div>
    <div v-if="pendingCapacity > 0" class="cap-pending-badge">{{ pendingCapacity }} طلب بانتظار الموافقة</div>
    <div v-if="capacityRequests.length > 0" class="cap-requests-list">
      <div v-for="req in capacityRequests" :key="req.id" class="cap-req-item">
        <span class="cap-req-status" :class="req.status">{{ req.status }}</span>
        <span>🎓 {{ req.requested_max_students || '—' }} | 👨‍🏫 {{ req.requested_max_teachers || '—' }}</span>
        <span class="cap-req-date">{{ new Date(req.created_at).toLocaleDateString(dateLocaleStr) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./school-dashboard.css"></style>
