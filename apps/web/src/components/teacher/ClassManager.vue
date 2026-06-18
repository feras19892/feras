<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../modules/auth/stores/auth'

const auth = useAuthStore()
const classes = ref<{ id: string; name: string; code: string }[]>([])
const showModal = ref(false)
const newClassName = ref('')

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function loadLocalClasses() {
  try {
    const raw = localStorage.getItem('physlab_guest_classes')
    if (raw) classes.value = JSON.parse(raw)
  } catch {
    classes.value = []
  }
}

function saveLocalClasses() {
  localStorage.setItem('physlab_guest_classes', JSON.stringify(classes.value))
}

function createClass() {
  if (!newClassName.value.trim()) return
  const newClass = {
    id: 'local-' + Date.now(),
    name: newClassName.value.trim(),
    code: generateCode(),
  }
  classes.value.push(newClass)
  saveLocalClasses()
  newClassName.value = ''
  showModal.value = false
}

function deleteClass(id: string) {
  if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return
  classes.value = classes.value.filter(c => c.id !== id)
  saveLocalClasses()
}

function copyCode(code: string) {
  navigator.clipboard?.writeText(code)
}

onMounted(() => {
  if (auth.guestMode) loadLocalClasses()
})
</script>

<template>
  <div class="class-manager">
    <div class="manager-header">
      <div class="header-title">
        <h2>🏫 فصولي</h2>
        <span v-if="classes.length" class="class-count">{{ classes.length }} فصل</span>
      </div>
      <button class="create-btn" @click="showModal = true">
        <span>+</span>
        <span>إنشاء فصل جديد</span>
      </button>
    </div>

    <div v-if="classes.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>لا توجد فصول بعد</p>
      <button class="create-btn alt" @click="showModal = true">أنشئ فصلك الأول</button>
    </div>

    <div v-else class="class-list">
      <div v-for="cls in classes" :key="cls.id" class="class-row">
        <span class="sc-icon">📚</span>
        <span class="sc-name">{{ cls.name }}</span>
        <span class="sc-code">{{ cls.code }}</span>
        <button class="sc-copy" @click="copyCode(cls.code)">📋</button>
        <button class="sc-delete" @click="deleteClass(cls.id)">🗑️</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="join-modal">
        <h3>إنشاء فصل جديد</h3>
        <input v-model="newClassName" type="text" placeholder="اسم الفصل" @keyup.enter="createClass" />
        <div class="join-actions">
          <button class="join-cancel" @click="showModal = false">إلغاء</button>
          <button class="join-confirm" @click="createClass">إنشاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.class-manager {
  width: 100%;
  margin: 0;
  padding: 1rem 1.5rem;
}

.manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.manager-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.class-count {
  font-size: 0.75rem;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.create-btn {
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

.create-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 22px rgba(79, 70, 229, 0.45);
}

.create-btn.alt {
  margin-top: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.class-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border-radius: 0.6rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
}

.class-row:hover {
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
  font-family: monospace;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(103, 232, 249, 0.15);
}

.sc-copy, .sc-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.sc-copy:hover, .sc-delete:hover { opacity: 1; }

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
</style>
