<script setup lang="ts">
import { computed } from 'vue';
import { useAnalysisStore } from '../../../stores/analysis.store';

const store = useAnalysisStore();
const info = computed(() => store.studentInfo);

function update(field: 'name' | 'email' | 'grade' | 'notes', val: string) {
  store.updateStudentInfo({ [field]: val });
}
</script>

<template>
  <div class="student-panel">
    <div class="panel-header">🎓 معلومات الطالب</div>
    <div class="form">
      <div class="row">
        <div class="field">
          <label>الاسم الكامل</label>
          <input type="text" :value="info.name" @input="update('name', ($event.target as HTMLInputElement).value)" placeholder="محمد أحمد" />
        </div>
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input type="email" :value="info.email" @input="update('email', ($event.target as HTMLInputElement).value)" placeholder="student@school.edu" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>الصف / الشعبة</label>
          <input type="text" :value="info.grade" @input="update('grade', ($event.target as HTMLInputElement).value)" placeholder="الصف العاشر - أ" />
        </div>
        <div class="field">
          <label>التاريخ</label>
          <input type="text" :value="store.reportDate" readonly />
        </div>
      </div>
      <div class="field full">
        <label>ملاحظات على التجربة</label>
        <textarea :value="info.notes" @input="update('notes', ($event.target as HTMLTextAreaElement).value)" rows="2" placeholder="اكتب ملاحظاتك عن التجربة..."></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.panel-header {
  padding: 0.45rem 0.7rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.85rem;
  color: #67e8f9;
  font-weight: 700;
}
.form { padding: 0.45rem; display: flex; flex-direction: column; gap: 0.35rem; }
.row { display: flex; gap: 0.35rem; }
.field { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.field.full { width: 100%; }
label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
input, textarea {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.3rem 0.4rem;
  font-size: 0.82rem;
  font-family: inherit;
}
input[readonly] { color: #64748b; }
textarea { resize: vertical; }
</style>
