<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import { useI18n } from '../composables/useI18n';
import { registerSchool } from '../services/school.service';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

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
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const formError = ref('');
const selectedRole = ref<'teacher' | 'student' | 'school'>('student');
const schoolCode = ref('');
const schoolName = ref('');
const maxStudents = ref(50);
const maxTeachers = ref(10);
const successCode = ref('');
const agreedToTerms = ref(false);

const isSchool = computed(() => selectedRole.value === 'school');
const fullName = computed(() => `${firstName.value.trim()} ${lastName.value.trim()}`.trim());

async function handleRegister() {
  formError.value = '';
  successCode.value = '';

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
  if (password.value.length < 8) {
    formError.value = t('auth.errors.passwordTooShort');
    return;
  }
  if (!agreedToTerms.value) {
    formError.value = t('legal.mustAgree');
    return;
  }

  // School registration path
  if (isSchool.value) {
    if (!schoolName.value.trim()) {
      formError.value = t('auth.errors.fillAll');
      return;
    }
    const res = await registerSchool(schoolName.value.trim(), trimmedEmail, password.value, maxStudents.value, maxTeachers.value);
    if (res.success && res.code) {
      successCode.value = res.code;
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

  const result = await auth.registerWithRole(
    trimmedEmail,
    password.value,
    fullName.value,
    selectedRole.value as 'student' | 'teacher',
    schoolCode.value.trim() || undefined,
  );
  if (result.ok) {
    router.push({
      path: '/verify-email',
      query: {
        email: trimmedEmail,
      },
    });
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

      <!-- Success: school code display -->
      <div v-if="successCode" class="success-box">
        <h2>✅ {{ t('school.registerSuccess') }}</h2>
        <p>{{ t('school.yourCode') }}:</p>
        <div class="code-display">{{ successCode }}</div>
        <p class="code-hint">{{ t('school.codeHint') }}</p>
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
        <!-- School code: only for student/teacher -->
        <div v-if="!isSchool" class="field">
          <label>{{ t('school.schoolCodeOptional') }}</label>
          <input v-model="schoolCode" type="text" :placeholder="t('school.schoolCodePlaceholder')" name="schoolCode" />
          <p class="field-hint">{{ t('school.schoolCodeHint') }}</p>
        </div>
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
          <label>{{ t('auth.confirmPasswordLabel') }}</label>
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
        <p v-if="formError" class="error">{{ formError }}</p>
        <label class="terms-check">
          <input type="checkbox" v-model="agreedToTerms" />
          <span>{{ t('legal.agreePrefix') }}
            <router-link to="/terms" target="_blank">{{ t('legal.termsLink') }}</router-link>
            {{ t('legal.andWord') }}
            <router-link to="/privacy" target="_blank">{{ t('legal.privacyLink') }}</router-link>
          </span>
        </label>
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
