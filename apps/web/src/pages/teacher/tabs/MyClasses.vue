<template>
  <div class="dash-page">
    <h2>فصولي</h2>
    <div class="toolbar-right">
      <button @click="showBroadcast = true" class="btn-add">📢 بث جماعي</button>
      <button @click="showCreate = true" class="btn-add">فصل جديد</button>
    </div>
    <SkeletonLoader v-if="store.loading" type="cards" :count="3" />
    <ErrorState v-else-if="store.error" :error="store.error" show-retry @retry="load" />
    <div v-if="store.classes.length" class="class-toolbar">
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('view')">👥 عرض الطلاب</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('rename')">✏️ إعادة تسمية</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('regenerate-code')">🔄 كود جديد</button>
      <button class="toolbar-btn" :disabled="!activeClass" @click="onActionActive('toggle-freeze')">
        {{ activeClass?.is_frozen ? '� إلغاء التجميد' : '� تجميد' }}
      </button>
      <button class="toolbar-btn toolbar-danger" :disabled="!activeClass" @click="onActionActive('delete')">🗑️ حذف</button>
    </div>
    <div v-if="store.classes.length" class="compact-list">
      <div
        v-for="cls in store.classes" :key="cls.id"
        class="compact-row"
        :class="{ 'row-selected': activeClass?.id === cls.id, 'class-frozen': !!cls.is_frozen }"
        @click="selectClass(cls)"
      >
        <span class="cr-icon">{{ cls.is_frozen ? '�' : '�' }}</span>
        <span class="cr-name">{{ cls.name }}<span v-if="cls.is_frozen" class="frozen-badge">مجمد</span></span>
        <span class="cr-meta">
          <span>الطلاب: {{ cls.student_count ?? 0 }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <span class="code-with-copy">
            {{ cls.code }}
            <button class="copy-btn" @click.stop="copyCode(cls.code)" title="نسخ الكود">📋</button>
          </span>
        </span>
        <div v-if="expandedClass?.id === cls.id" @click.stop>
          <ClassStudents :class-id="cls.id" ref="classStudentsRef" @open-profile="(sid) => openStudentProfile(cls.id, sid)" />
        </div>
      </div>
    </div>
    <EmptyState v-else icon="📚" title="لا توجد فصول" />

    <ClassFormModal
      :open="showCreate || !!renameTarget"
      :mode="renameTarget ? 'rename' : 'create'"
      :initial-name="renameTarget?.name || ''"
      :loading="creating || renaming"
      @close="showCreate = false; renameTarget = null"
      @submit="onFormSubmit"
    />

    <StudentDetailModal
      :open="studentProfileOpen"
      :class-id="studentProfileClassId"
      :student-id="studentProfileStudentId"
      @close="studentProfileOpen = false"
      @updated="onStudentUpdated"
    />

    <BroadcastModal
      :open="showBroadcast"
      :classes="store.classes"
      :teacher-name="teacherName"
      @close="showBroadcast = false"
    />

    <ConfirmModal
      :open="removeTarget !== null"
      icon="🗑️"
      title="تأكيد إزالة الطالب"
      :message="`هل تريد إزالة هذا الطالب من الفصل ${expandedClass?.name || ''}؟`"
      confirm-label="إزالة"
      cancel-label="إلغاء"
      variant="danger"
      :loading="removingStudent === removeTarget"
      @confirm="confirmRemove"
      @cancel="removeTarget = null"
    />

    <ConfirmModal
      :open="deleteTarget !== null"
      icon="🗑️"
      title="تأكيد حذف الفصل"
      :message="`هل تريد حذف الفصل &quot;${deleteTarget?.name || ''}&quot;؟ سيتم حذف جميع التقارير والطلاب المرتبطين به.`"
      confirm-label="متابعة"
      cancel-label="إلغاء"
      variant="danger"
      :loading="false"
      @confirm="deleteConfirm1 = true"
      @cancel="deleteTarget = null"
    />

    <ConfirmModal
      :open="deleteConfirm1"
      icon="⚠️"
      title="تحذير نهائي"
      message="العملية لا يمكن التراجع عنها! سيتم حذف الفصل وكل ما يتعلق به نهائياً. هل أنت متأكد؟"
      confirm-label="حذف نهائي"
      cancel-label="تراجع"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteConfirm1 = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTeacherClasses } from '@/composables/teacher/useTeacherClasses'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import StudentDetailModal from './StudentDetailModal.vue'
import BroadcastModal from './BroadcastModal.vue'
import ClassFormModal from './ClassFormModal.vue'
import ClassStudents from './ClassStudents.vue'

const c = useTeacherClasses()
const classStudentsRef = ref<InstanceType<typeof ClassStudents> | null>(null)

async function onStudentUpdated() {
  await c.store.fetchClasses(true)
  classStudentsRef.value?.reload()
}

async function confirmRemove() {
  await c.confirmRemove()
  classStudentsRef.value?.reload()
}

const {
  store, teacherName, showCreate, creating, activeClass, expandedClass,
  removingStudent, removeTarget, renameTarget, renaming, deleteTarget, deleting, deleteConfirm1,
  studentProfileOpen, studentProfileClassId, studentProfileStudentId, showBroadcast,
  copyCode, openStudentProfile, selectClass, onActionActive,
  onFormSubmit, confirmDelete, load,
} = c
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
</style>
