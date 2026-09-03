<template>
  <div class="dash-page">
    <h2>الطلاب</h2>
    <div class="toolbar-right">
      <button @click="showAddModal = true" class="btn-add">➕ طالب جديد</button>
      <button @click="handleExport" class="btn-export">📊 تصدير CSV</button>
    </div>
    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث بالاسم أو البريد..." style="max-width: 240px;" />
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الحالات</option>
        <option value="active">نشط</option>
        <option value="blocked">محظور</option>
      </select>
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="3" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-if="students.length" class="class-toolbar">
      <button class="toolbar-btn" :disabled="!activeStudent" @click="onActionActive('detail')">👁️ تفاصيل</button>
      <button class="toolbar-btn" :disabled="!activeStudent" @click="onActionActive('warn')">⚠️ تحذير</button>
      <button class="toolbar-btn" :disabled="!activeStudent" @click="onActionActive('report')">📢 بلاغ أدمن</button>
      <button class="toolbar-btn" :disabled="!activeStudent" @click="onActionActive('alert')">🔔 إرسال تنبيه</button>
      <button v-if="activeStudent?.is_blocked" class="toolbar-btn" :disabled="!activeStudent" @click="onActionActive('unblock')">✅ إلغاء الحظر</button>
      <button v-else class="toolbar-btn" :disabled="!activeStudent" @click="onActionActive('block')">🚫 حظر</button>
      <button class="toolbar-btn toolbar-danger" :disabled="!activeStudent" @click="onActionActive('delete')">🗑️ حذف</button>
    </div>
    <div v-if="students.length" class="compact-list">
      <div
        v-for="s in pagedStudents" :key="s.id"
        class="compact-row"
        :class="{ 'row-selected': activeStudent?.id === s.id, 'class-frozen': s.is_blocked }"
        @click="selectStudent(s)"
      >
        <span class="cr-icon">{{ s.is_blocked ? '🚫' : '👨‍🎓' }}</span>
        <span class="cr-name">{{ s.name }}<span v-if="s.is_blocked" class="frozen-badge">محظور</span></span>
        <span class="cr-meta">
          <span>فصول: {{ s.class_count }}</span>
          <span>تقارير: {{ s.total_reports }}</span>
          <span>معلّق: {{ s.pending_reports }}</span>
          <span :class="['st-rate', gradingClass(s)]">تصحيح: {{ Math.round(s.grading_rate) }}%</span>
          <span>وسام: {{ s.badge_count }}</span>
          <span :class="['st-score', scoreClass(s)]">أداء: {{ Math.round(s.student_score) }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <span class="st-email">{{ s.email }}</span>
        </span>
        <SchoolStudentDetail v-if="expandedStudent?.id === s.id" :detail-data="detailData" :detail-loading="detailLoading" :student="s" />
      </div>
    </div>
    <Pagination
      v-if="filteredStudents.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredStudents.length"
      @change="currentPage = $event"
    />
    <EmptyState v-else icon="👨‍🎓" title="لا يوجد طلاب" />

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>إضافة طالب جديد</h3>
        <div class="form-group"><label>الاسم</label><input v-model="newUser.name" class="form-input" /></div>
        <div class="form-group"><label>البريد الإلكتروني</label><input v-model="newUser.email" class="form-input" /></div>
        <div class="form-group"><label>كلمة المرور</label><input v-model="newUser.password" type="password" class="form-input" /></div>
        <div class="modal-actions">
          <button @click="handleAddUser" class="btn-sm btn-success" :disabled="adding">{{ adding ? '...' : 'إضافة' }}</button>
          <button @click="showAddModal = false" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="warnTarget" class="modal-overlay" @click.self="warnTarget = null">
      <div class="modal-content">
        <h3>تحذير: {{ warnTarget.name }}</h3>
        <div class="form-group"><label>العنوان</label><input v-model="warnForm.title" class="form-input" /></div>
        <div class="form-group"><label>الرسالة</label><textarea v-model="warnForm.message" class="form-input" rows="3"></textarea></div>
        <div class="form-group"><label>مستوى الخطورة</label>
          <select v-model="warnForm.severity" class="form-input">
            <option value="low">منخفضة</option><option value="normal">متوسطة</option><option value="high">عالية</option><option value="critical">حرجة</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="handleWarn" class="btn-sm btn-danger" :disabled="warnLoading">{{ warnLoading ? '...' : 'إرسال' }}</button>
          <button @click="warnTarget = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="reportTarget" class="modal-overlay" @click.self="reportTarget = null">
      <div class="modal-content">
        <h3>بلاغ للأدمن: {{ reportTarget.name }}</h3>
        <div class="form-group"><label>السبب</label><input v-model="reportForm.reason" class="form-input" /></div>
        <div class="form-group"><label>التفاصيل</label><textarea v-model="reportForm.details" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="handleReport" class="btn-sm btn-danger" :disabled="reportLoading">{{ reportLoading ? '...' : 'إرسال' }}</button>
          <button @click="reportTarget = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="alertTarget" class="modal-overlay" @click.self="alertTarget = null">
      <div class="modal-content">
        <h3>إرسال تنبيه: {{ alertTarget.name }}</h3>
        <div class="form-group"><label>العنوان</label><input v-model="alertForm.title" class="form-input" /></div>
        <div class="form-group"><label>الرسالة</label><textarea v-model="alertForm.message" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="handleAlert" class="btn-sm btn-primary" :disabled="alertLoading">{{ alertLoading ? '...' : 'إرسال' }}</button>
          <button @click="alertTarget = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="blockTarget !== null"
      icon="🚫"
      title="تأكيد الحظر"
      :message="blockTarget ? `هل تريد حظر ${blockTarget.name}؟ لن يتمكن من الدخول للنظام.` : ''"
      confirm-label="متابعة"
      cancel-label="إلغاء"
      variant="danger"
      @confirm="blockConfirm1 = true"
      @cancel="blockTarget = null"
    />
    <ConfirmModal
      :open="blockConfirm1"
      icon="⚠️"
      title="تحذير نهائي"
      :message="blockTarget ? `سيتم حظر ${blockTarget.name} فوراً. هل أنت متأكد تماماُ؟` : ''"
      confirm-label="حظر نهائي"
      cancel-label="تراجع"
      variant="danger"
      :loading="blockLoading"
      @confirm="confirmBlock"
      @cancel="blockConfirm1 = false"
    />
    <ConfirmModal
      :open="unblockTarget !== null"
      icon="✅"
      title="إلغاء الحظر"
      :message="unblockTarget ? `هل تريد إلغاء حظر ${unblockTarget.name}؟` : ''"
      confirm-label="إلغاء الحظر"
      cancel-label="تراجع"
      variant="success"
      :loading="unblockLoading"
      @confirm="confirmUnblock"
      @cancel="unblockTarget = null"
    />
    <ConfirmModal
      :open="deleteTarget !== null"
      icon="🗑️"
      title="تأكيد الحذف"
      :message="deleteTarget ? `هل تريد حذف الطالب ${deleteTarget.name}؟ سيتم حذف جميع بياناته نهائياً.` : ''"
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
      :message="deleteTarget ? `تحذير: سيتم حذف ${deleteTarget.name} وكل ما يتعلق به نهائياً! لا يمكن التراجع. هل أنت متأكد تماماُ؟` : ''"
      confirm-label="حذف نهائي"
      cancel-label="تراجع"
      variant="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteConfirm1 = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useSchoolStudents } from '@/composables/school/useSchoolStudents'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import Pagination from '@/components/shared/Pagination.vue'
import SchoolStudentDetail from './SchoolStudentDetail.vue'

const {
  loading, error, students, activeStudent, expandedStudent, detailData, detailLoading,
  search, statusFilter, currentPage, pageLimit, filteredStudents, pagedStudents,
  selectStudent, onActionActive, loadDetail, gradingClass, scoreClass,
  showAddModal, adding, newUser, handleAddUser,
  warnTarget, warnLoading, warnForm, handleWarn,
  reportTarget, reportLoading, reportForm, handleReport,
  alertTarget, alertLoading, alertForm, handleAlert,
  blockTarget, blockConfirm1, blockLoading, confirmBlock,
  unblockTarget, unblockLoading, confirmUnblock,
  deleteTarget, deleteConfirm1, deleteLoading, confirmDelete,
  handleExport, formatDate, load,
} = useSchoolStudents()
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
/* تنظيم شريط الأدوات لمنع الازدحام */
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
.st-rate { font-weight: 700; }
.st-rate--good { color: var(--success-text); }
.st-rate--mid { color: var(--warning-text); }
.st-rate--bad { color: var(--danger-text); }
.st-score { font-weight: 700; }
.st-score--good { color: var(--success-text); }
.st-score--mid { color: var(--warning-text); }
.st-score--bad { color: var(--danger-text); }
.st-email { font-size: 11px; color: var(--text-muted); }
.teacher-expand { width: 100%; margin-top: 8px; padding: 12px; border-top: 1px dashed var(--border-color); }
.compact-row { flex-wrap: wrap; }
</style>
