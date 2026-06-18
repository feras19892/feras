<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../modules/auth/stores/auth'

const router = useRouter()
const auth = useAuthStore()

defineProps<{
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', val: string): void
}>()

function setTab(tab: string) {
  emit('update:activeTab', tab)
}
</script>

<template>
  <nav class="top-nav">
    <div class="nav-brand" @click="router.push('/home')">
      <span class="brand-icon">⚛️</span>
      <span class="brand-text">PhysLab</span>
    </div>

    <!-- Admin Tools (center) -->
    <div v-if="auth.isAdmin" class="nav-tools">
      <button class="tool-btn admin-tool" @click="router.push('/admin')">
        <span class="tool-icon">🛡️</span>
        <span class="tool-label">الإدارة</span>
      </button>
    </div>

    <!-- Teacher Tools (center) -->
    <div v-else-if="auth.isTeacher" class="nav-tools">
      <button class="tool-btn" :class="{ active: activeTab === 'classes' }" @click="setTab('classes')">
        <span class="tool-icon">🏫</span>
        <span class="tool-label">فصولي</span>
      </button>
      <button class="tool-btn" :class="{ active: activeTab === 'experiments' }" @click="setTab('experiments')">
        <span class="tool-icon">📋</span>
        <span class="tool-label">تجاربي</span>
      </button>
      <button class="tool-btn" :class="{ active: activeTab === 'grading' }" @click="setTab('grading')">
        <span class="tool-icon">✅</span>
        <span class="tool-label">تصحيح</span>
      </button>
      <button class="tool-btn" :class="{ active: activeTab === 'stats' }" @click="setTab('stats')">
        <span class="tool-icon">📊</span>
        <span class="tool-label">إحصائيات</span>
      </button>
    </div>

    <!-- Student Tools (center) -->
    <div v-else-if="auth.isStudent" class="nav-tools">
      <button class="tool-btn" :class="{ active: activeTab === 'classes' }" @click="setTab('classes')">
        <span class="tool-icon">🏫</span>
        <span class="tool-label">فصولي</span>
      </button>
      <button class="tool-btn" :class="{ active: activeTab === 'branches' }" @click="setTab('branches')">
        <span class="tool-icon">⚛️</span>
        <span class="tool-label">الفروع</span>
      </button>
      <button class="tool-btn" :class="{ active: activeTab === 'reports' }" @click="setTab('reports')">
        <span class="tool-icon">📄</span>
        <span class="tool-label">تقاريري</span>
      </button>
    </div>

    <!-- User / Logout -->
    <div class="nav-user">
      <div class="user-badge" v-if="auth.isTeacher">
        <span class="user-icon">👨‍🏫</span>
        <span class="user-role">معلم</span>
      </div>
      <div class="user-badge student" v-else>
        <span class="user-icon">🎓</span>
        <span class="user-role">طالب</span>
      </div>
      <button class="logout-btn" @click="auth.logout(); router.push('/')">خروج</button>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 2rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}
.brand-icon { font-size: 1.6rem; }
.brand-text {
  font-size: 1.3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-tools {
  display: flex;
  gap: 0.3rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  background: transparent;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}
.tool-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}
.tool-btn.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
  color: #c7d2fe;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.08);
}
.tool-btn.admin-tool {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}
.tool-btn.admin-tool:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fff;
}
.tool-icon { font-size: 1rem; }
.tool-label { font-size: 0.82rem; }

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.user-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.15);
}
.user-icon { font-size: 1.1rem; }
.user-role {
  font-size: 0.75rem;
  font-weight: 700;
  color: #c7d2fe;
}
.user-badge.student {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}
.user-badge.student .user-role {
  color: #6ee7b7;
}
.logout-btn {
  padding: 0.4rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

@media (max-width: 768px) {
  .top-nav { padding: 0.8rem 1rem; flex-wrap: wrap; }
  .nav-tools { position: static; transform: none; order: 3; width: 100%; justify-content: center; margin-top: 0.5rem; }
  .tool-label { display: none; }
  .tool-btn { padding: 0.5rem; }
}
</style>
