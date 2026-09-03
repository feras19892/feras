<script setup lang="ts">
import { ref } from 'vue';
import { MessageSquare } from 'lucide-vue-next';
import { useAuthStore } from '@/modules/auth/stores/auth';
import FeedbackModal from './FeedbackModal.vue';

const auth = useAuthStore();
const show = ref(false);
</script>

<template>
  <div v-if="auth.isAuthenticated" class="feedback-fab" @click="show = true" role="button" aria-label="إبلاغ عن مشكلة" title="إبلاغ عن مشكلة">
    <MessageSquare :size="22" />
  </div>
  <FeedbackModal v-model:show="show" />
</template>

<style scoped>
.feedback-fab {
  position: fixed;
  bottom: 1.25rem;
  left: 1.25rem;
  z-index: 1000;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.feedback-fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 26px rgba(99, 102, 241, 0.45);
}
.feedback-fab:active { transform: scale(0.95); }
</style>
