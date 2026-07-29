<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import ApprovalPanel from '../components/shared/ApprovalPanel.vue';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import NotificationBell from '../components/shared/NotificationBell.vue';

const router = useRouter();
const auth = useAuthStore();

const mode = computed<'student' | 'teacher' | 'school' | 'admin'>(() => {
  return (auth.user?.role || auth.role) as any;
});

const title = computed(() => {
  switch (mode.value) {
    case 'admin': return 'لوحة الموافقات — الأدمن';
    case 'school': return 'لوحة الموافقات — المدرسة';
    case 'teacher': return 'لوحة الموافقات — المدرس';
    case 'student': return 'لوحة الاعتراضات — الطالب';
    default: return 'لوحة الموافقات';
  }
});
</script>

<template>
  <div class="ap-page">
    <div class="ap-page-header">
      <div class="ap-back" @click="router.back()">
        <span>← رجوع</span>
      </div>
      <h2>{{ title }}</h2>
      <div class="ap-page-right">
        <AccountSettingsModal />
        <NotificationBell />
        <button class="logout-btn" @click="auth.logout(); router.push('/')">خروج</button>
      </div>
    </div>

    <ApprovalPanel :mode="mode" />
  </div>
</template>

<style scoped>
.ap-page { min-height: 100vh; background: #0a0f1e; color: #e2e8f0; padding: 1rem; max-width: 900px; margin: 0 auto; }
.ap-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.ap-back { cursor: pointer; color: #94a3b8; font-size: 0.85rem; transition: color 0.15s; }
.ap-back:hover { color: #c7d2fe; }
.ap-page-header h2 { font-size: 1.1rem; color: #f1f5f9; margin: 0; }
.ap-page-right { display: flex; align-items: center; gap: 0.6rem; }
.logout-btn { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: 0.78rem; cursor: pointer; font-family: inherit; }
</style>
