<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { joinClass as apiJoinClass, getMyClasses } from '../../services/class.service'
import type { ClassItem } from '../../services/class.service'

const { t } = useI18n()
const showJoinModal = ref(false)
const joinCode = ref('')
const joinError = ref('')
const joinLoading = ref(false)
const classes = ref<ClassItem[]>([])
const loading = ref(false)

async function loadClasses() {
  loading.value = true
  try {
    const res = await getMyClasses()
    if (res.success) classes.value = res.classes
  } catch (err) {
    console.error('load classes failed:', err)
  } finally {
    loading.value = false
  }
}

async function handleJoinClass() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code) { joinError.value = t('dashboard.enterCodeFirst'); return }
  joinLoading.value = true; joinError.value = ''

  try {
    const res = await apiJoinClass(code)
    joinLoading.value = false
    if (res.success && res.class_id && res.name) {
      classes.value.push({
        id: res.class_id,
        name: res.name,
        code: code,
        is_active: 1,
        created_at: new Date().toISOString(),
      })
      showJoinModal.value = false
      joinCode.value = ''
    } else {
      joinError.value = res.message || t('dashboard.invalidCode')
    }
  } catch (err) {
    joinLoading.value = false
    joinError.value = t('dashboard.joinFailed')
    console.error('join class failed:', err)
  }
}

onMounted(() => {
  loadClasses()
})
</script>

<template>
  <div class="student-classes">
    <div class="student-classes-header">
      <h2>{{ t('dashboard.myClassesTitle') }}</h2>
      <button class="join-btn" @click="showJoinModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>{{ t('dashboard.joinClass') }}</span>
      </button>
    </div>
    <div v-if="loading" class="student-empty"><p>...</p></div>
    <div v-else-if="classes.length === 0" class="student-empty">
      <p>{{ t('dashboard.noClassesJoined') }}</p>
      <p class="sub">{{ t('dashboard.joinClassHint') }}</p>
    </div>
    <div v-else class="student-class-list">
      <div v-for="cls in classes" :key="cls.id" class="student-class-row">
        <span class="sc-icon">📚</span>
        <span class="sc-name">{{ cls.name }}</span>
        <span class="sc-code">{{ cls.code }}</span>
      </div>
    </div>

    <!-- Join Modal -->
    <div v-if="showJoinModal" class="modal-overlay" @click.self="showJoinModal = false">
      <div class="join-modal">
        <h3>{{ t('dashboard.joinClassModalTitle') }}</h3>
        <input v-model="joinCode" type="text" :placeholder="t('dashboard.enterClassCode')" maxlength="8" @keyup.enter="handleJoinClass" />
        <p v-if="joinError" class="join-error">{{ joinError }}</p>
        <div class="join-actions">
          <button class="join-cancel" @click="showJoinModal = false">{{ t('dashboard.close') }}</button>
          <button class="join-confirm" :disabled="joinLoading" @click="handleJoinClass">
            {{ joinLoading ? '...' : t('dashboard.joinAction') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-classes {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.student-classes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.student-classes-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.join-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35);
  transition: all 0.25s ease;
}
.join-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 22px rgba(79, 70, 229, 0.45);
}
.student-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}
.student-empty .sub {
  font-size: 0.85rem;
  color: #475569;
  margin-top: 0.3rem;
}
.student-class-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.student-class-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border-radius: 0.6rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.07);
  cursor: pointer;
  transition: all 0.2s;
}
.student-class-row:hover {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.04);
}
.sc-icon { font-size: 1.2rem; }
.sc-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f1f5f9;
}
.sc-code {
  font-size: 0.85rem;
  font-weight: 700;
  color: #67e8f9;
  font-family: 'SF Mono', monospace;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(103, 232, 249, 0.15);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.join-modal {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.join-modal h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f1f5f9;
  text-align: center;
}
.join-modal input {
  padding: 0.7rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
  text-align: center;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.join-modal input::placeholder {
  color: #475569;
  text-transform: none;
  letter-spacing: normal;
}
.join-error {
  color: #f87171;
  font-size: 0.8rem;
  text-align: center;
  margin: 0;
}
.join-actions {
  display: flex;
  gap: 0.5rem;
}
.join-cancel, .join-confirm {
  flex: 1;
  padding: 0.55rem;
  border-radius: 0.55rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.join-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}
.join-confirm {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: none;
}
.join-confirm:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
