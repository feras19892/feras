<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, watch } from 'vue';
import type { AdminSchool } from '../../../services/school.service';
const props = defineProps<{ school: AdminSchool }>();
const emit = defineEmits<{ save: [data: { name: string; email: string; max_students: number; max_teachers: number }] }>();

const name = ref(props.school.name);
const email = ref(props.school.email);
const maxStudents = ref(props.school.max_students);
const maxTeachers = ref(props.school.max_teachers);

watch(() => props.school, (s) => {
  name.value = s.name;
  email.value = s.email;
  maxStudents.value = s.max_students;
  maxTeachers.value = s.max_teachers;
});

function handleSave() {
  emit('save', {
    name: name.value,
    email: email.value,
    max_students: maxStudents.value,
    max_teachers: maxTeachers.value,
  });
}
</script>

<template>
  <div class="edit-form">
    <div class="form-field">
      <label>{{ t('admin.schoolEditName') }}</label>
      <input v-model="name" type="text" />
    </div>
    <div class="form-field">
      <label>{{ t('admin.schoolEditEmail') }}</label>
      <input v-model="email" type="email" />
    </div>
    <div class="form-row">
      <div class="form-field half">
        <label>{{ t('admin.schoolEditMaxStudents') }}</label>
        <input v-model.number="maxStudents" type="number" min="1" max="10000" />
      </div>
      <div class="form-field half">
        <label>{{ t('admin.schoolEditMaxTeachers') }}</label>
        <input v-model.number="maxTeachers" type="number" min="1" max="500" />
      </div>
    </div>
    <button class="btn-save" @click="handleSave">{{ t('admin.schoolEditSave') }}</button>
  </div>
</template>

<style scoped>
.edit-form { max-width: 400px; display: flex; flex-direction: column; gap: 0.8rem; }
.form-field { display: flex; flex-direction: column; gap: 0.3rem; }
.form-field label { font-size: 0.8rem; color: #64748b; }
.form-field input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.6rem 0.8rem; color: #e2e8f0; font-size: 0.9rem; }
.form-field input:focus { outline: none; border-color: rgba(6,182,212,0.4); }
.form-row { display: flex; gap: 0.8rem; }
.form-field.half { flex: 1; }
.btn-save { background: linear-gradient(135deg, #06b6d4, #0891b2); border: none; border-radius: 0.5rem; padding: 0.7rem; color: #fff; font-weight: 700; cursor: pointer; font-size: 0.9rem; margin-top: 0.5rem; }
.btn-save:hover { opacity: 0.9; }
</style>
