<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import {
  updateSchoolName, changeSchoolPassword, requestEmailChange,
  type School,
} from '../../services/school.service';

const props = defineProps<{ school: School | null }>();
const emit = defineEmits<{ schoolUpdated: [School] }>();

const { t } = useI18n();

const editName = ref('');
const savingName = ref(false);
const nameMsg = ref('');
const currentPwd = ref('');
const newPwd = ref('');
const savingPwd = ref(false);
const pwdMsg = ref('');
const newEmail = ref('');
const savingEmail = ref(false);
const emailMsg = ref('');

async function handleSaveName() {
  if (editName.value.trim().length < 2) return;
  savingName.value = true; nameMsg.value = '';
  const res = await updateSchoolName(editName.value.trim());
  savingName.value = false;
  if (res.success && res.school) { emit('schoolUpdated', res.school); nameMsg.value = t('school.settingsSaved'); }
  else nameMsg.value = res.message || t('school.settingsSaveFailed');
}

async function handleChangePassword() {
  if (newPwd.value.length < 8) { pwdMsg.value = t('school.pwdTooShort'); return; }
  savingPwd.value = true; pwdMsg.value = '';
  const res = await changeSchoolPassword(currentPwd.value, newPwd.value);
  savingPwd.value = false;
  if (res.success) { pwdMsg.value = t('school.pwdChanged'); currentPwd.value = ''; newPwd.value = ''; }
  else pwdMsg.value = res.message || t('school.pwdChangeFailed');
}

async function handleEmailChange() {
  if (!newEmail.value.trim()) return;
  savingEmail.value = true; emailMsg.value = '';
  const res = await requestEmailChange(newEmail.value.trim());
  savingEmail.value = false;
  if (res.success) { emailMsg.value = t('school.emailRequestSent'); newEmail.value = ''; }
  else emailMsg.value = res.message || t('school.emailRequestFailed');
}
</script>

<template>
  <div class="settings-grid">
    <div class="settings-card">
      <h3>{{ t('school.settingsEditName') }}</h3>
      <input v-model="editName" type="text" class="settings-input" :placeholder="t('school.settingsSchoolNamePlaceholder')" />
      <button class="settings-btn" :disabled="savingName" @click="handleSaveName">{{ savingName ? '...' : t('school.settingsSave') }}</button>
      <p v-if="nameMsg" class="settings-msg">{{ nameMsg }}</p>
    </div>
    <div class="settings-card">
      <h3>{{ t('school.settingsChangePassword') }}</h3>
      <input v-model="currentPwd" type="password" class="settings-input" :placeholder="t('school.settingsCurrentPwd')" />
      <input v-model="newPwd" type="password" class="settings-input" :placeholder="t('school.settingsNewPwd')" />
      <button class="settings-btn" :disabled="savingPwd" @click="handleChangePassword">{{ savingPwd ? '...' : t('school.settingsChange') }}</button>
      <p v-if="pwdMsg" class="settings-msg">{{ pwdMsg }}</p>
    </div>
    <div class="settings-card">
      <h3>{{ t('school.settingsEmailChange') }}</h3>
      <p class="settings-hint">{{ t('school.settingsCurrentEmail') }}: <strong>{{ school?.email }}</strong></p>
      <p class="settings-hint">{{ t('school.settingsEmailHint') }}</p>
      <input v-model="newEmail" type="email" class="settings-input" :placeholder="t('school.settingsNewEmailPlaceholder')" />
      <button class="settings-btn" :disabled="savingEmail" @click="handleEmailChange">{{ savingEmail ? '...' : t('school.settingsSendRequest') }}</button>
      <p v-if="emailMsg" class="settings-msg">{{ emailMsg }}</p>
    </div>
  </div>
</template>

<style scoped>
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
.settings-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
.settings-card h3 { margin: 0 0 0.3rem; font-size: 1rem; color: #e2e8f0; }
.settings-input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 0.5rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.85rem; box-sizing: border-box; }
.settings-input:focus { outline: none; border-color: #06b6d4; }
.settings-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.settings-btn:disabled { opacity: 0.6; cursor: wait; }
.settings-msg { font-size: 0.8rem; margin: 0; }
.settings-hint { font-size: 0.78rem; color: #94a3b8; margin: 0; }
</style>
