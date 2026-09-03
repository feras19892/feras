<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../../modules/auth/stores/auth';
import SubmitReportModal from '../../../components/experiment/SubmitReportModal.vue';

const props = defineProps<{
  experimentId?: string;
  experimentName: string;
  experimentType?: string;
}>();

const auth = useAuthStore();
const reportOpen = ref(false);
</script>

<template>
  <button
    v-if="experimentId"
    class="header-action"
    :disabled="!auth.isLoggedIn"
    @click="reportOpen = true"
    :title="'إرسال التقرير'"
  >
    📋 إرسال التقرير
  </button>
  <SubmitReportModal
    v-if="experimentId"
    v-model:show="reportOpen"
    :experiment-type="experimentType ?? 'biology'"
    :experiment-id="experimentId"
    :experiment-name="experimentName"
    :readings="'[]'"
    :params="'{}'"
  />
</template>
