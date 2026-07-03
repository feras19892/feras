<script setup lang="ts">
import { currentMessage, assistantOpen, toggleAssistant } from '../../../composables/chemistry/useLabAssistant';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();

const typeIcons: Record<string, string> = {
  warning: '⚠️',
  info: '💡',
  success: '🎉',
  tip: '🔬',
};

const typeClasses: Record<string, string> = {
  warning: 'msg-warning',
  info: 'msg-info',
  success: 'msg-success',
  tip: 'msg-tip',
};
</script>

<template>
  <div class="lab-assistant" :class="{ collapsed: !assistantOpen }">
    <div class="assistant-header" @click="toggleAssistant()">
      <div class="assistant-avatar">
        <span>🤖</span>
      </div>
      <div class="assistant-title">
        <span class="title-text">{{ t('chemistryLab.labAssistant') }}</span>
        <span v-if="currentMessage && !assistantOpen" class="badge">1</span>
      </div>
      <button class="toggle-btn">
        <span v-if="assistantOpen">▼</span>
        <span v-else>▲</span>
      </button>
    </div>
    <div v-if="assistantOpen" class="assistant-body">
      <div v-if="!currentMessage" class="assistant-empty">
        <span class="empty-icon">🧪</span>
        <p>{{ t('chemistryLab.assistantWelcome') }}</p>
      </div>
      <div v-else class="assistant-single" :class="typeClasses[currentMessage.type]">
        <span class="msg-icon">{{ typeIcons[currentMessage.type] }}</span>
        <span class="msg-text">{{ currentMessage.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lab-assistant {
  position: relative;
  width: 100%;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}
.lab-assistant.collapsed {
  width: 180px;
}
.lab-assistant.collapsed .assistant-body {
  display: none;
}
.assistant-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: linear-gradient(135deg, #1e293b, #334155);
  color: #fff;
  cursor: pointer;
  user-select: none;
}
.assistant-avatar {
  font-size: 1.3rem;
  animation: float 2s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.assistant-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.title-text {
  font-size: 0.75rem;
  font-weight: 700;
}
.badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.05rem 0.35rem;
  border-radius: 1rem;
  min-width: 18px;
  text-align: center;
}
.toggle-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  border-radius: 0.3rem;
  padding: 0.1rem 0.3rem;
  font-size: 0.65rem;
  cursor: pointer;
}
.assistant-body {
  max-height: 240px;
  overflow-y: auto;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.assistant-empty {
  text-align: center;
  padding: 1rem 0.5rem;
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1.6;
}
.empty-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.3rem;
}
.assistant-messages {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.assistant-single {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 0.78rem;
  line-height: 1.5;
  animation: slideIn 0.3s ease;
  direction: rtl;
  text-align: right;
  min-height: 40px;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.msg-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.msg-text {
  flex: 1;
}
.msg-warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
.msg-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}
.msg-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}
.msg-tip {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
.assistant-body::-webkit-scrollbar {
  width: 4px;
}
.assistant-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
