<script setup lang="ts">
import { useClassManager } from '../../composables/teacher/useClassManager'
import CreateClassModal from './CreateClassModal.vue'

const { classes, showModal, newClassName, createClass, deleteClass, copyCode } = useClassManager()
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

    <CreateClassModal
      v-model:show="showModal"
      v-model="newClassName"
      @confirm="createClass"
    />
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

</style>
