<template>
  <div class="schedule-panel">
    <div class="panel-header">
      <h2 class="panel-title">الجدول الزمني</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        ➕ إضافة حصة
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="loading" class="loading-state">
      <p>جاري التحميل...</p>
    </div>

    <div v-else-if="schedules.length === 0" class="empty-state">
      <p>لا يوجد جدول زمني حالياً</p>
    </div>

    <div v-else class="schedule-grid">
      <div v-for="day in 7" :key="day" class="day-column">
        <div class="day-header">{{ getDayName(day - 1) }}</div>
        <div class="day-slots">
          <div
            v-for="schedule in getSchedulesForDay(day - 1)"
            :key="schedule.id"
            class="schedule-item"
          >
            <div class="schedule-time">{{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}</div>
            <div class="schedule-subject">{{ schedule.subject || 'بدون موضوع' }}</div>
            <div class="schedule-room">{{ schedule.room || '' }}</div>
            <div class="schedule-actions">
              <button class="btn-icon" @click="editSchedule(schedule)" title="تعديل">✏️</button>
              <button class="btn-icon" @click="deleteSchedule(schedule.id)" title="حذف">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal" @click.stop>
        <h3>{{ editingSchedule ? 'تعديل الحصة' : 'إضافة حصة جديدة' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>الفصل</label>
            <select v-model="formData.class_id" required>
              <option value="">اختر الفصل</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>اليوم</label>
            <select v-model="formData.day_of_week" required>
              <option v-for="(name, index) in dayNames" :key="index" :value="index">
                {{ name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>من</label>
              <input v-model="formData.start_time" type="time" required />
            </div>
            <div class="form-group">
              <label>إلى</label>
              <input v-model="formData.end_time" type="time" required />
            </div>
          </div>
          <div class="form-group">
            <label>الموضوع</label>
            <input v-model="formData.subject" type="text" placeholder="الموضوع" />
          </div>
          <div class="form-group">
            <label>الغرفة</label>
            <input v-model="formData.room" type="text" placeholder="رقم الغرفة" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">إلغاء</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSchedulesByTeacher, createSchedule, updateSchedule, deleteSchedule as deleteScheduleApi, getDayName, formatTime } from '@/services/schedule.service';
import { getMyClasses } from '@/services/class.service';
import type { Schedule } from '@/services/schedule.service';

const schedules = ref<Schedule[]>([]);
const classes = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const showAddModal = ref(false);
const editingSchedule = ref<Schedule | null>(null);

const formData = ref({
  class_id: 0,
  day_of_week: 0,
  start_time: '',
  end_time: '',
  subject: '',
  room: '',
});

const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const loadSchedules = async () => {
  loading.value = true;
  error.value = '';
  const result = await getSchedulesByTeacher();
  loading.value = false;
  
  if (result.success && result.schedules) {
    schedules.value = result.schedules;
  } else {
    error.value = result.message || 'فشل تحميل الجدول الزمني';
  }
};

const loadClasses = async () => {
  const result = await getMyClasses();
  if (result.success && result.classes) {
    classes.value = result.classes;
  }
};

const getSchedulesForDay = (dayOfWeek: number) => {
  return schedules.value.filter(s => s.day_of_week === dayOfWeek);
};

const editSchedule = (schedule: Schedule) => {
  editingSchedule.value = schedule;
  formData.value = {
    class_id: schedule.class_id,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    subject: schedule.subject || '',
    room: schedule.room || '',
  };
  showAddModal.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = '';

  try {
    if (editingSchedule.value) {
      const result = await updateSchedule(editingSchedule.value.id, formData.value);
      if (!result.success) {
        error.value = result.message || 'فشل تحديث الحصة';
        submitting.value = false;
        return;
      }
    } else {
      const result = await createSchedule(formData.value);
      if (!result.success) {
        error.value = result.message || 'فشل إضافة الحصة';
        submitting.value = false;
        return;
      }
    }

    showAddModal.value = false;
    editingSchedule.value = null;
    formData.value = {
      class_id: 0,
      day_of_week: 0,
      start_time: '',
      end_time: '',
      subject: '',
      room: '',
    };
    await loadSchedules();
  } catch (err: any) {
    error.value = err.message || 'حدث خطأ';
  }

  submitting.value = false;
};

const deleteSchedule = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) return;

  const result = await deleteScheduleApi(id);
  if (result.success) {
    await loadSchedules();
  } else {
    error.value = result.message || 'فشل حذف الحصة';
  }
};

onMounted(() => {
  loadSchedules();
  loadClasses();
});
</script>

<style scoped>
.schedule-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.8rem;
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-secondary {
  background: rgba(99, 102, 241, 0.1);
  color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.6rem;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  overflow-x: auto;
}

.day-column {
  min-width: 140px;
}

.day-header {
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.day-slots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.schedule-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}

.schedule-time {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.schedule-subject {
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.schedule-room {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.schedule-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 1rem;
  color: #e2e8f0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #6366f1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
