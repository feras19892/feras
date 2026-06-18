<script setup lang="ts">
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
    <input v-model="email" type="email" placeholder="البريد الإلكتروني" required />
    <input v-model="password" type="password" placeholder="كلمة المرور" required />
    <button type="submit">تسجيل الدخول</button>
  </form>
</template>
