<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref } from 'vue';
import { fetchJson } from '../../services/http';


const props = defineProps<{
  pendingAction: { action: string; label: string } | null
}>();

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirmed', action: string, password: string): void
}>();

const emergencyPassword = ref('');
const passwordError = ref('');
const showChangePwd = ref(false);
const currentPwd = ref('');
const newPwd = ref('');
const confirmPwd = ref('');
const changePwdMsg = ref<{ type: 'success' | 'error'; text: string } | null>(null);
const changingPwd = ref(false);

function onConfirm() {
  if (!emergencyPassword.value.trim()) {
    passwordError.value = 'الرجاء إدخال كلمة مرور الطوارئ';
    return;
  }
  emit('confirmed', props.pendingAction!.action, emergencyPassword.value.trim());
  emergencyPassword.value = '';
  passwordError.value = '';
}

function onCancel() {
  emergencyPassword.value = '';
  passwordError.value = '';
  emit('cancel');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') onCancel();
}

async function handleChangeEmergencyPwd() {
  if (!currentPwd.value.trim() || !newPwd.value.trim() || !confirmPwd.value.trim()) {
    changePwdMsg.value = { type: 'error', text: 'يرجى ملء جميع الحقول' };
    return;
  }
  if (newPwd.value !== confirmPwd.value) {
    changePwdMsg.value = { type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' };
    return;
  }
  if (newPwd.value.length < 6) {
    changePwdMsg.value = { type: 'error', text: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' };
    return;
  }
  changingPwd.value = true;
  changePwdMsg.value = null;
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/admin/emergency/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPwd.value.trim(), new_password: newPwd.value.trim() }),
    });
    if (res.success) {
      changePwdMsg.value = { type: 'success', text: res.message || 'تم تغيير كلمة المرور بنجاح' };
      currentPwd.value = ''; newPwd.value = ''; confirmPwd.value = '';
      showChangePwd.value = false;
    } else {
      changePwdMsg.value = { type: 'error', text: res.message || 'فشل تغيير كلمة المرور' };
    }
  } catch (e: unknown) {
    changePwdMsg.value = { type: 'error', text: e instanceof Error ? e.message : String(e) || 'فشل تغيير كلمة المرور' };
  }
  changingPwd.value = false;
  setTimeout(() => { changePwdMsg.value = null; }, 5000);
}
</script>

<template>
  <!-- Change emergency password -->
  <div class="pwd-change-section">
    <button class="pwd-change-toggle" @click="showChangePwd = !showChangePwd">🔐 تغيير كلمة مرور الطوارئ</button>
    <div v-if="showChangePwd" class="pwd-change-form">
      <div v-if="changePwdMsg" :class="['pwd-change-msg', changePwdMsg.type]">{{ changePwdMsg.text }}</div>
      <input v-model="currentPwd" type="password" placeholder="كلمة المرور الحالية" class="pwd-change-input" />
      <input v-model="newPwd" type="password" placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" class="pwd-change-input" />
      <input v-model="confirmPwd" type="password" placeholder="تأكيد كلمة المرور الجديدة" class="pwd-change-input" />
      <button class="pwd-change-btn" :disabled="changingPwd" @click="handleChangeEmergencyPwd">{{ changingPwd ? '⏳ جاري...' : 'تغيير كلمة المرور' }}</button>
    </div>
  </div>

  <!-- Password confirmation modal -->
  <Teleport to="body">
    <div v-if="pendingAction" class="pwd-overlay" @click.self="onCancel" @keydown="onKeydown" tabindex="-1">
      <div class="pwd-card">
        <div class="pwd-header">
          <h3>🔐 تأكيد إجراء الطوارئ</h3>
          <button class="pwd-close" @click="onCancel">✕</button>
        </div>
        <div class="pwd-body">
          <p class="pwd-warning">⚠️ أنت على وشك تنفيذ: <strong>{{ pendingAction.label }}</strong></p>
          <p class="pwd-hint">هذا إجراء حساس يتطلب كلمة مرور الطوارئ.</p>
          <div class="pwd-field">
            <input v-model="emergencyPassword" type="password" placeholder="كلمة مرور الطوارئ" @keyup.enter="onConfirm" autofocus />
          </div>
          <p v-if="passwordError" class="pwd-error">{{ passwordError }}</p>
          <div class="pwd-actions">
            <button class="pwd-btn-cancel" @click="onCancel">إلغاء</button>
            <button class="pwd-btn-confirm" @click="onConfirm">تأكيد التنفيذ</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.pwd-change-section { margin-top: 0.5rem; }
.pwd-change-toggle { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); border-radius: 0.4rem; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.pwd-change-toggle:hover { background: rgba(99,102,241,0.2); }
.pwd-change-form { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.6rem; max-width: 360px; }
.pwd-change-input { padding: 0.5rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.6); color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.pwd-change-input:focus { outline: none; border-color: rgba(99,102,241,0.5); }
.pwd-change-btn { padding: 0.5rem 1rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
.pwd-change-btn:disabled { opacity: 0.6; cursor: wait; }
.pwd-change-msg { padding: 0.4rem 0.6rem; border-radius: 0.3rem; font-size: 0.78rem; }
.pwd-change-msg.success { background: rgba(34,197,94,0.12); color: #4ade80; }
.pwd-change-msg.error { background: rgba(239,68,68,0.12); color: #f87171; }
.pwd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.pwd-card { width: 100%; max-width: 380px; background: #0f172a; border: 1px solid rgba(239,68,68,0.3); border-radius: 1rem; overflow: hidden; }
.pwd-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.pwd-header h3 { margin: 0; font-size: 1rem; color: #f87171; }
.pwd-close { width: 28px; height: 28px; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer; font-size: 0.8rem; }
.pwd-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.pwd-body { padding: 1.2rem; }
.pwd-warning { font-size: 0.85rem; color: #fbbf24; margin: 0 0 0.5rem; }
.pwd-hint { font-size: 0.75rem; color: #64748b; margin: 0 0 1rem; }
.pwd-field input { width: 100%; padding: 0.7rem 0.8rem; border-radius: 0.5rem; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 0.9rem; box-sizing: border-box; }
.pwd-field input:focus { outline: none; border-color: #ef4444; }
.pwd-error { color: #fca5a5; font-size: 0.78rem; margin: 0.5rem 0 0; }
.pwd-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.pwd-btn-cancel { flex: 1; padding: 0.6rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.82rem; }
.pwd-btn-cancel:hover { background: rgba(255,255,255,0.08); }
.pwd-btn-confirm { flex: 1; padding: 0.6rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 700; }
.pwd-btn-confirm:hover { opacity: 0.9; }
</style>
