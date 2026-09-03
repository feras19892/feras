<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';

import { registerSchool } from '../services/school.service';





const router = useRouter();
const auth = useAuthStore();

onMounted(() => {
  // Clear user/guest session via auth store, preserve school session
  if (auth.isLoggedIn && !auth.isSchool) {
    auth.logout();
  }
});

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const inviteCode = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const formError = ref('');
const selectedRole = ref<'teacher' | 'student' | 'school'>('student');
const age = ref<number | ''>('');
const agreed = ref(false);
const schoolName = ref('');
const maxStudents = ref(50);
const maxTeachers = ref(10);
const successMessage = ref('');

const isSchool = computed(() => selectedRole.value === 'school');
const fullName = computed(() => `${firstName.value.trim()} ${lastName.value.trim()}`.trim());

async function handleRegister() {
  formError.value = '';
  successMessage.value = '';

  const trimmedEmail = email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    formError.value = t('auth.errors.invalidEmail');
    return;
  }
  if (password.value !== confirmPassword.value) {
    formError.value = t('auth.errors.passwordsMismatch');
    return;
  }

  // School registration path
  if (isSchool.value) {
    if (!schoolName.value.trim()) {
      formError.value = t('auth.errors.fillAll');
      return;
    }
    const res = await registerSchool(schoolName.value.trim(), trimmedEmail, password.value, maxStudents.value, maxTeachers.value);
    if (res.success) {
      successMessage.value = t('school.registerSuccess', 'تم تسجيل مدرستك بنجاح');
      if (res.school) {
        auth.setSchoolSession(res.school);
      }
    } else {
      formError.value = res.message || t('auth.errors.registerFailed');
    }
    return;
  }

  // Student / Teacher registration path
  if (!fullName.value || fullName.value.length < 2) {
    formError.value = t('auth.errors.nameTooShort');
    return;
  }

  const ageNum = age.value !== '' ? Number(age.value) : undefined;
  if (selectedRole.value !== 'school' && (ageNum === undefined || !Number.isFinite(ageNum) || !Number.isInteger(ageNum) || ageNum < 14)) {
    formError.value = t('auth.errors.ageTooYoung', 'يجب أن يكون العمر 14 عاماً أو أكثر');
    return;
  }
  if (selectedRole.value !== 'school' && !agreed.value) {
    formError.value = t('auth.errors.consentRequired', 'يجب الموافقة على سياسة الخصوصية وشروط الاستخدام');
    return;
  }

  const result = await auth.registerWithRole(
    trimmedEmail,
    password.value,
    fullName.value,
    selectedRole.value as 'student' | 'teacher',
    inviteCode.value || undefined,
    inviteCode.value || undefined,
    ageNum,
    agreed.value,
  );
  if (result.ok) {
    router.push('/');
  } else {
    formError.value = auth.error || t('auth.errors.registerFailed');
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="app-header">
        <h1>{{ t('auth.registerTitle') }}</h1>
        <p class="subtitle">
          {{ isSchool ? t('school.registerSubtitle') : selectedRole === 'teacher' ? t('auth.roleTeacher') : t('auth.roleStudent') }}
        </p>
      </div>

      <!-- Success: school registered -->
      <div v-if="successMessage" class="success-box">
        <h2>✅ {{ successMessage }}</h2>
        <button class="btn-submit" @click="router.push('/school')">{{ t('school.goToDashboard') }}</button>
        <button class="btn-secondary" @click="router.push('/school/login')">{{ t('school.goToLogin') }}</button>
      </div>

      <form v-else @submit.prevent="handleRegister">
        <!-- Name fields: only for student/teacher -->
        <div v-if="!isSchool" class="field-row">
          <div class="field half">
            <label>{{ t('auth.firstNameLabel', 'First Name') }}</label>
            <input v-model="firstName" type="text" required autocomplete="given-name" name="firstName" />
          </div>
          <div class="field half">
            <label>{{ t('auth.lastNameLabel', 'Last Name') }}</label>
            <input v-model="lastName" type="text" required autocomplete="family-name" name="lastName" />
          </div>
        </div>
        <!-- School name: only for school -->
        <div v-if="isSchool" class="field">
          <label>{{ t('school.nameLabel') }}</label>
          <input v-model="schoolName" type="text" required :placeholder="t('school.namePlaceholder')" />
        </div>
        <div class="field">
          <label>{{ t('auth.roleLabel') }}</label>
          <div class="role-toggle">
            <button
              type="button"
              class="role-option"
              :class="{ active: selectedRole === 'student' }"
              @click="selectedRole = 'student'"
            >
              🎓 {{ t('auth.roleStudent') }}
            </button>
            <button
              type="button"
              class="role-option"
              :class="{ active: selectedRole === 'teacher' }"
              @click="selectedRole = 'teacher'"
            >
              👨‍🏫 {{ t('auth.roleTeacher') }}
            </button>
            <button
              type="button"
              class="role-option school"
              :class="{ active: isSchool }"
              @click="selectedRole = 'school'"
            >
              🏫 {{ t('school.roleSchool') }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.emailLabel') }}</label>
          <input v-model="email" type="email" required autocomplete="username" name="email" />
        </div>
        <!-- Age: only for student/teacher -->
        <div v-if="!isSchool" class="field">
          <label>{{ t('auth.ageLabel', 'العمر') }}</label>
          <input v-model.number="age" type="number" min="14" max="120" required :placeholder="t('auth.agePlaceholder', 'مثلاً 16')" />
        </div>
        <div v-if="!isSchool" class="field consent-field">
          <label class="consent-label">
            <input v-model="agreed" type="checkbox" required />
            <span>
              {{ t('auth.consentPrefix', 'أوافق على') }}
              <router-link to="/privacy">{{ t('legal.privacyLink', 'سياسة الخصوصية') }}</router-link>
              {{ t('legal.andWord', 'و') }}
              <router-link to="/terms">{{ t('legal.termsLink', 'شروط الاستخدام') }}</router-link>
            </span>
          </label>
        </div>
        <!-- School code: only for student/teacher -->
        <!-- Capacity fields: only for school -->
        <div v-if="isSchool" class="field-row">
          <div class="field half">
            <label>{{ t('school.maxStudents') }}</label>
            <input v-model.number="maxStudents" type="number" min="1" max="10000" required />
          </div>
          <div class="field half">
            <label>{{ t('school.maxTeachers') }}</label>
            <input v-model.number="maxTeachers" type="number" min="1" max="500" required />
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.passwordLabel') }}</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              name="password"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPassword = !showPassword"
              :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.confirmPasswordLabel', 'تأكيد كلمة السر') }}</label>
          <div class="password-wrapper">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              name="confirmPassword"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div v-if="!isSchool" class="field">
          <label>{{ t('auth.inviteCodeLabel', 'كود المدرسة أو كود الدعوة (اختياري)') }}</label>
          <input
            v-model="inviteCode"
            type="text"
            autocomplete="off"
            name="inviteCode"
            :placeholder="t('auth.inviteCodePlaceholder', 'ادخل كود المدرسة أو الدعوة')"
          />
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <button type="submit" class="btn-submit" :disabled="auth.loading">
          {{ auth.loading ? t('auth.loading') : isSchool ? t('school.registerBtn') : t('auth.registerBtn') }}
        </button>
      </form>
      <router-link to="/" class="back-link">
        ← {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>


<style scoped src='./register.css'></style>
