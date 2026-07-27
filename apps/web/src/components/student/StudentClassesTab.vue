<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { ClassItem, ClassStudent } from '../../services/class.service'

const props = defineProps<{
  classes: ClassItem[]
  classStudentsMap: Record<string, ClassStudent[]>
  currentUserId: number
  joinFn: (code: string) => Promise<any>
  leaveFn: (id: string) => Promise<any>
  activeChatId?: string | null
}>()

const emit = defineEmits<{ (e: 'open-chat', cls: { id: string; name: string }): void }>()

const { t } = useI18n()
const expandedId = ref<string | null>(null)
const showJoinModal = ref(false)
const joinCode = ref('')
const joinError = ref('')
const joinLoading = ref(false)

function toggleClass(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

async function handleJoin() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code) { joinError.value = t('dashboard.enterCodeFirst'); return }
  joinLoading.value = true
  joinError.value = ''
  try {
    const res = await props.joinFn(code)
    if (res && res.success) {
      showJoinModal.value = false
      joinCode.value = ''
    } else {
      joinError.value = res?.message || t('dashboard.invalidCode')
    }
  } catch {
    joinError.value = t('dashboard.joinFailed')
  }
  joinLoading.value = false
}

async function handleLeave(cls: ClassItem) {
  await props.leaveFn(cls.id)
  if (expandedId.value === cls.id) expandedId.value = null
}
</script>

<template>
  <div class="tab-panel">
    <!-- Join class button -->
    <div class="panel-card join-bar">
      <button class="join-btn" @click="showJoinModal = true">
        <span>➕</span> {{ t('dashboard.joinClass') }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="classes.length === 0" class="panel-card">
      <div class="pc-empty">
        <p>📚 {{ t('dashboard.noClassesJoined') }}</p>
        <p class="sub">{{ t('dashboard.joinClassHint') }}</p>
      </div>
    </div>

    <!-- Class cards with classmates -->
    <div v-for="c in classes" :key="c.id" class="panel-card cls-card">
      <div class="cls-header" @click="toggleClass(c.id)">
        <span class="cls-icon">📚</span>
        <div class="cls-info">
          <span class="cls-name">{{ c.name }}</span>
          <code class="cls-code">{{ c.code }}</code>
        </div>
        <div class="cls-meta">
          <span class="cls-count">👥 {{ classStudentsMap[c.id]?.length || 0 }}</span>
          <button :class="['chat-toggle-btn', { active: props.activeChatId === c.id }]" @click.stop="emit('open-chat', { id: c.id, name: c.name })">💬</button>
          <span class="cls-expand">{{ expandedId === c.id ? '▼' : '◀' }}</span>
        </div>
      </div>

      <!-- Classmates list -->
      <div v-if="expandedId === c.id" class="cls-body">
        <div v-if="!classStudentsMap[c.id] || classStudentsMap[c.id].length === 0" class="cls-empty">
          👤 لا يوجد طلاب آخرون
        </div>
        <div v-else class="mates-list">
          <div
            v-for="s in classStudentsMap[c.id]"
            :key="s.id"
            :class="['mate-row', { me: s.id === props.currentUserId }]"
          >
            <span class="mate-avatar">{{ s.id === props.currentUserId ? '😎' : '🎓' }}</span>
            <div class="mate-info">
              <span class="mate-name">{{ s.name }}<span v-if="s.id === props.currentUserId" class="me-tag">({{ t('dashboard.dash.you') }})</span></span>
              <span class="mate-email">{{ s.email }}</span>
            </div>
            <span class="mate-date">{{ s.joined_at?.slice(0, 10) }}</span>
          </div>
        </div>
        <button class="leave-btn" @click.stop="handleLeave(c)">
          {{ t('dashboard.leaveClass') }}
        </button>
        <button class="collapse-btn" @click.stop="toggleClass(c.id)">
          ← {{ t('dashboard.backToClasses') }}
        </button>
      </div>
    </div>

    <!-- Join Modal -->
    <div v-if="showJoinModal" class="modal-overlay" @click.self="showJoinModal = false">
      <div class="join-modal">
        <h3>{{ t('dashboard.joinClassModalTitle') }}</h3>
        <input v-model="joinCode" type="text" :placeholder="t('dashboard.enterClassCode')" maxlength="8" @keyup.enter="handleJoin" />
        <p v-if="joinError" class="join-error">{{ joinError }}</p>
        <div class="join-actions">
          <button class="join-cancel" @click="showJoinModal = false">{{ t('dashboard.close') }}</button>
          <button class="join-confirm" :disabled="joinLoading" @click="handleJoin">
            {{ joinLoading ? '...' : t('dashboard.joinAction') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel { }
.join-bar { display: flex; justify-content: center; }
.join-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.2rem; border: none; border-radius: 0.6rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.join-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.35); }
.panel-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1rem; margin-bottom: 0.6rem; }
.pc-empty { text-align: center; color: #64748b; padding: 1.2rem; font-size: 0.82rem; }
.pc-empty .sub { font-size: 0.78rem; color: #475569; margin-top: 0.3rem; }
.cls-card { padding: 0; overflow: hidden; }
.cls-header { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1rem; cursor: pointer; transition: background 0.12s; }
.cls-header:hover { background: rgba(99,102,241,0.04); }
.cls-icon { font-size: 1.1rem; }
.cls-info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.cls-name { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; }
.cls-code { font-size: 0.72rem; color: #67e8f9; font-family: monospace; letter-spacing: 1px; }
.cls-meta { display: flex; align-items: center; gap: 0.6rem; }
.cls-count { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.chat-toggle-btn { width: 28px; height: 28px; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.15); background: rgba(99,102,241,0.06); color: #c7d2fe; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; padding: 0; }
.chat-toggle-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); }
.chat-toggle-btn.active { background: rgba(99,102,241,0.25); border-color: rgba(99,102,241,0.4); }
.cls-expand { font-size: 0.7rem; color: #64748b; }
.cls-body { padding: 0.6rem 1rem 0.8rem; border-top: 1px solid rgba(255,255,255,0.04); }
.cls-empty { text-align: center; color: #64748b; padding: 0.8rem; font-size: 0.8rem; }
.mates-list { display: flex; flex-direction: column; gap: 0.3rem; }
.mate-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 0.4rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); transition: all 0.12s; }
.mate-row.me { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.15); }
.mate-avatar { font-size: 1rem; flex-shrink: 0; }
.mate-info { flex: 1; display: flex; flex-direction: column; }
.mate-name { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; }
.me-tag { font-size: 0.68rem; color: #a5b4fc; margin-inline-start: 0.3rem; }
.mate-email { font-size: 0.68rem; color: #64748b; }
.mate-date { font-size: 0.65rem; color: #475569; }
.leave-btn { margin-top: 0.6rem; width: 100%; padding: 0.4rem; border-radius: 0.4rem; border: 1px solid rgba(239,68,68,0.15); background: rgba(239,68,68,0.05); color: #f87171; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.leave-btn:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); }
.collapse-btn { margin-top: 0.4rem; width: 100%; padding: 0.4rem; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.15); background: rgba(99,102,241,0.06); color: #c7d2fe; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.collapse-btn:hover { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.25); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.join-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 360px; display: flex; flex-direction: column; gap: 0.8rem; }
.join-modal h3 { margin: 0; font-size: 1.1rem; color: #f1f5f9; text-align: center; }
.join-modal input { padding: 0.7rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.9rem; font-family: inherit; text-align: center; letter-spacing: 2px; text-transform: uppercase; }
.join-modal input::placeholder { color: #475569; text-transform: none; letter-spacing: normal; }
.join-error { color: #f87171; font-size: 0.8rem; text-align: center; margin: 0; }
.join-actions { display: flex; gap: 0.5rem; }
.join-cancel, .join-confirm { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); }
.join-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; }
.join-confirm { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.join-confirm:disabled { opacity: 0.6; cursor: wait; }
</style>
