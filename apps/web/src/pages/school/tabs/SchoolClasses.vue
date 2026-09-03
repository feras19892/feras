<template>
  <div class="dash-page">
    <h2>الفصول</h2>
    <div class="toolbar-right">
      <button @click="showAddModal = true" class="btn-add">➕ فصل جديد</button>
      <button @click="handleExport" class="btn-export">📊 تصدير CSV</button>
    </div>
    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث باسم/كود/مدرس..." style="max-width: 240px;" />
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الحالات</option>
        <option value="active">نشط</option>
        <option value="frozen">مجمد</option>
      </select>
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="3" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-if="classes.length" class="class-toolbar">
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('detail')">👁️ تفاصيل</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('edit')">✏️ تعديل</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('students')">🎓 الطلاب</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('alert')">🔔 تنبيه</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('reassign')">👨‍🏫 تعيين مدرس</button>
      <button v-if="activeClass?.is_frozen" class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('unfreeze')">✅ إلغاء تجميد</button>
      <button v-else class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('freeze')">❄️ تجميد</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('activity')">📋 سجل النشاط</button>
      <button class="toolbar-btn toolbar-danger" :disabled="!activeClass" @click="onActionActive('delete')">🗑️ حذف</button>
    </div>
    <div v-if="classes.length" class="compact-list">
      <div
        v-for="c in pagedClasses" :key="c.id"
        class="compact-row"
        :class="{ 'row-selected': activeClass?.id === c.id, 'class-frozen': !!c.is_frozen }"
        @click="selectClass(c)"
      >
        <span class="cr-icon">{{ c.is_frozen ? '❄️' : '📚' }}</span>
        <span class="cr-name">{{ c.name }}<span v-if="c.is_frozen" class="frozen-badge">مجمد</span></span>
        <span class="cr-meta">
          <span>الكود: {{ c.code }}</span>
          <span>الطلاب: {{ c.student_count }}</span>
          <span>المدرس: {{ c.teacher_name || '—' }}</span>
          <span>التقارير: {{ c.report_count ?? 0 }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <span class="st-email">{{ formatDate(c.created_at) }}</span>
        </span>
        <div v-if="expandedClass?.id === c.id" class="teacher-expand" @click.stop>
          <SchoolClassDetail :detail="detailData" :extra="extraStats" :loading="detailLoading" />
        </div>
      </div>
    </div>
    <Pagination
      v-if="filteredClasses.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredClasses.length"
      @change="currentPage = $event"
    />
    <EmptyState v-else icon="📚" title="لا توجد فصول" />

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>إضافة فصل جديد</h3>
        <div class="form-group"><label>اسم الفصل</label><input v-model="newClass.name" class="form-input" /></div>
        <div class="form-group"><label>المدرس</label>
          <select v-model.number="newClass.teacherId" class="form-input">
            <option :value="0">غير معيّن</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="form-group"><label>الوصف</label><input v-model="newClass.description" class="form-input" /></div>
        <div class="modal-actions">
          <button @click="handleAddClass" class="btn-sm btn-success" :disabled="adding">{{ adding ? '...' : 'إضافة' }}</button>
          <button @click="showAddModal = false" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="reassignTarget" class="modal-overlay" @click.self="reassignTarget = null">
      <div class="modal-content">
        <h3>تعيين مدرس لفصل {{ reassignTarget.name }}</h3>
        <div class="form-group"><label>المدرس</label>
          <select v-model.number="reassignTeacherId" class="form-input">
            <option :value="0">غير معيّن</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="confirmReassign" class="btn-sm btn-success" :disabled="reassignLoading">{{ reassignLoading ? '...' : 'حفظ' }}</button>
          <button @click="reassignTarget = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="showFreezeModal" class="modal-overlay" @click.self="showFreezeModal = false">
      <div class="modal-content">
        <h3>تجميد: {{ freezeTarget?.name }}</h3>
        <div class="form-group"><label>السبب</label><input v-model="freezeReason" class="form-input" /></div>
        <div class="modal-actions">
          <button @click="confirmFreeze" class="btn-sm btn-warn" :disabled="freezeLoading">{{ freezeLoading ? '...' : 'تجميد' }}</button>
          <button @click="showFreezeModal = false" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="showActivityModal" class="modal-overlay" @click.self="showActivityModal = false">
      <div class="modal-content" style="max-height: 60vh; overflow-y: auto;">
        <h3>سجل نشاط الفصل</h3>
        <SkeletonLoader v-if="activityLoading" type="list" :count="4" />
        <ul v-else-if="activityLogs.length" class="activity-list">
          <li v-for="log in activityLogs" :key="log.id"><strong>{{ log.actor_name || 'النظام' }}</strong> — {{ log.action }}<br/><small>{{ formatDate(log.created_at) }} {{ log.details ? `: ${log.details}` : '' }}</small></li>
        </ul>
        <EmptyState v-else icon="📋" title="لا يوجد سجلات" />
      </div>
    </div>

    <div v-if="alertTarget" class="modal-overlay" @click.self="alertTarget = null">
      <div class="modal-content">
        <h3>تنبيه: {{ alertTarget.name }}</h3>
        <div class="form-group"><label>العنوان</label><input v-model="alertForm.title" class="form-input" /></div>
        <div class="form-group"><label>الرسالة</label><textarea v-model="alertForm.message" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="handleAlert" class="btn-sm btn-primary" :disabled="alertLoading">{{ alertLoading ? '...' : 'إرسال' }}</button>
          <button @click="alertTarget = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="editTarget" class="modal-overlay" @click.self="editTarget = null">
      <div class="modal-content">
        <h3>تعديل: {{ editTarget.name }}</h3>
        <div class="form-group"><label>اسم الفصل</label><input v-model="editForm.name" class="form-input" /></div>
        <div class="form-group"><label>الوصف</label><textarea v-model="editForm.description" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="confirmEdit" class="btn-sm btn-success" :disabled="editLoading">{{ editLoading ? '...' : 'حفظ' }}</button>
          <button @click="editTarget = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="manageStudentsTarget" class="modal-overlay" @click.self="manageStudentsTarget = null">
      <div class="modal-content" style="max-height: 70vh; overflow-y: auto; max-width: 520px;">
        <h3>إدارة طلاب: {{ manageStudentsTarget.name }}</h3>
        <div v-if="manageStudentsLoading" class="text-center"><SkeletonLoader type="list" :count="4" /></div>
        <div v-else>
          <div class="form-group" style="display: flex; gap: 8px;">
            <select v-model.number="selectedAddStudent" class="form-input" style="flex: 1;">
              <option :value="0">اختر طالباً</option>
              <option v-for="s in availableStudents" :key="s.id" :value="s.id">{{ s.name }} ({{ s.email }})</option>
            </select>
            <button @click="addStudent" class="btn-sm btn-success" :disabled="!selectedAddStudent || addStudentLoading">{{ addStudentLoading ? '...' : 'إضافة' }}</button>
          </div>
          <div v-if="classStudents.length" class="detail-table-wrap">
            <table class="detail-table">
              <thead><tr><th>الطالب</th><th>البريد</th><th></th></tr></thead>
              <tbody>
                <tr v-for="s in classStudents" :key="s.id">
                  <td>{{ s.name }}</td>
                  <td>{{ s.email }}</td>
                  <td><button class="toolbar-btn toolbar-danger" @click="removeStudent(s.id)" :disabled="removeStudentLoading === s.id">{{ removeStudentLoading === s.id ? '...' : 'إزالة' }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <EmptyState v-else icon="🎓" title="لا يوجد طلاب مسجلين" />
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="deleteTarget !== null"
      icon="🗑️"
      title="تأكيد الحذف"
      :message="deleteTarget ? `هل تريد حذف الفصل ${deleteTarget.name}؟ سيتم حذف كل بياناته.` : ''"
      confirm-label="متابعة"
      cancel-label="إلغاء"
      variant="danger"
      @confirm="deleteConfirm1 = true"
      @cancel="deleteTarget = null"
    />
    <ConfirmModal
      :open="deleteConfirm1"
      icon="⚠️"
      title="تحذير نهائي"
      :message="deleteTarget ? `سيتم حذف ${deleteTarget.name} نهائياً. هل أنت متأكد؟` : ''"
      confirm-label="حذف نهائي"
      cancel-label="تراجع"
      variant="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteConfirm1 = false"
    />
    <ConfirmModal
      :open="unfreezeTarget !== null"
      icon="✅"
      title="إلغاء التجميد"
      :message="unfreezeTarget ? `هل تريد إلغاء تجميد ${unfreezeTarget.name}؟` : ''"
      confirm-label="إلغاء التجميد"
      cancel-label="تراجع"
      variant="success"
      :loading="unfreezeLoading"
      @confirm="confirmUnfreeze"
      @cancel="unfreezeTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useSchoolClasses } from '@/composables/school/useSchoolClasses'
import SchoolClassDetail from './SchoolClassDetail.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import Pagination from '@/components/shared/Pagination.vue'

const {
  loading, error, activeClass, expandedClass, detailData, extraStats, detailLoading, teachers,
  classes, search, statusFilter, currentPage, pageLimit, filteredClasses, pagedClasses,
  selectClass, onActionActive, showAddModal, adding, newClass, handleAddClass,
  reassignTarget, reassignTeacherId, reassignLoading, confirmReassign,
  freezeTarget, freezeReason, freezeLoading, showFreezeModal, confirmFreeze,
  unfreezeTarget, unfreezeLoading, confirmUnfreeze,
  deleteTarget, deleteConfirm1, deleteLoading, confirmDelete,
  alertTarget, alertLoading, alertForm, handleAlert,
  activityLogs, activityLoading, showActivityModal, openActivity,
  handleExport, formatDate,
  editTarget, editForm, editLoading, confirmEdit,
  manageStudentsTarget, manageStudentsLoading, allStudents, selectedAddStudent,
  addStudentLoading, removeStudentLoading, manageDetail, classStudents, availableStudents,
  addStudent, removeStudent,
  load,
} = useSchoolClasses()
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
.class-toolbar {
  flex-wrap: wrap;
  gap: 6px;
  row-gap: 8px;
}
.class-toolbar .toolbar-btn {
  padding: 7px 10px;
  font-size: 12px;
  white-space: nowrap;
}
.teacher-expand { width: 100%; margin-top: 8px; padding: 12px; border-top: 1px dashed var(--border-color); }
.compact-row { flex-wrap: wrap; }
.activity-list { list-style: none; padding: 0; margin: 0; }
.activity-list li { padding: 10px 0; border-bottom: 1px solid var(--border-color); }
</style>
