<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const { login } = useAuth();
const email = ref('');
const password = ref('');

async function handleSubmit() {
  await login(email.value, password.value);
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" :placeholder="t('auth.emailLabel')" required />
    <input v-model="password" type="password" :placeholder="t('auth.passwordLabel')" required />
    <button type="submit">{{ t('auth.loginBtn') }}</button>
  </form>
</template>
