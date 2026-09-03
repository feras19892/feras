<template>
  <div class="dash-page">
    <button class="link-btn" @click="goBack">← رجوع للمدارس</button>
    <SkeletonLoader v-if="store.dashLoading" type="cards" :count="3" />
    <ErrorState v-else-if="store.errorMsg" :error="store.errorMsg" show-retry @retry="load" />
    <template v-else-if="school">
      <SchoolActionBar :active="school.is_active !== false" :show-view="false" :show-edit="false" :show-toggle="false" :show-delete="false" @users="goToTab('users')" @classes="goToTab('classes')" @reports="goToTab('reports')" />

      <section class="dash-welcome">
        <div class="dash-welcome__text">
          <h1 class="dash-welcome__title">{{ school.name }}</h1>
          <p class="dash-welcome__subtitle">{{ school.code }}</p>
          <p class="dash-welcome__subtitle">
            <span class="badge" :class="school.is_active !== false ? 'badge-success' : 'badge-danger'">{{ school.is_active !== false ? 'نشطة' : 'غير نشطة' }}</span>
          </p>
        </div>
      </section>

      <section class="stat-cards-grid">
        <div class="stat-card-modern clickable" @click="goToTab('users')"><div class="stat-card-modern__icon" style="background:#22c55e22;color:#22c55e">👥</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#22c55e">{{ school.user_count ?? 0 }}</div><div class="stat-card-modern__label">المستخدمون</div></div></div>
        <div class="stat-card-modern clickable" @click="goToTab('classes')"><div class="stat-card-modern__icon" style="background:#3b82f622;color:#3b82f6">📚</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#3b82f6">{{ school.class_count ?? 0 }}</div><div class="stat-card-modern__label">الفصول</div></div></div>
        <div class="stat-card-modern clickable" @click="goToTab('reports')"><div class="stat-card-modern__icon" style="background:#f59e0b22;color:#f59e0b">📝</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#f59e0b">{{ school.report_count ?? 0 }}</div><div class="stat-card-modern__label">التقارير</div></div></div>
        <div class="stat-card-modern"><div class="stat-card-modern__icon" style="background:#0e749022;color:#0e7490">🎓</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#0e7490">{{ school.max_students ?? 0 }}</div><div class="stat-card-modern__label">حد الطلاب</div></div></div>
        <div class="stat-card-modern"><div class="stat-card-modern__icon" style="background:#6366f122;color:#6366f1">👨‍🏫</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#6366f1">{{ school.max_teachers ?? 0 }}</div><div class="stat-card-modern__label">حد المعلمين</div></div></div>
      </section>

      <section class="lists-grid">
        <div class="list-card">
          <div class="list-header"><h3>معلومات المدرسة</h3></div>
          <div class="list-row"><span>الرقم</span><strong>{{ school.id }}</strong></div>
          <div class="list-row"><span>الاسم</span><strong>{{ school.name }}</strong></div>
          <div class="list-row"><span>الكود</span><strong>{{ school.code }}</strong></div>
          <div class="list-row"><span>الحالة</span><strong>{{ school.is_active !== false ? 'نشطة' : 'غير نشطة' }}</strong></div>
          <div class="list-row"><span>حد الطلاب</span><strong>{{ school.max_students ?? 0 }}</strong></div>
          <div class="list-row"><span>حد المعلمين</span><strong>{{ school.max_teachers ?? 0 }}</strong></div>
        </div>

        <div class="list-card clickable" @click="goToTab('users')">
          <div class="list-header"><h3>المستخدمون</h3></div>
          <p class="list-empty">{{ school.user_count ?? 0 }} مستخدم مرتبط بالمدرسة</p>
        </div>

        <div class="list-card clickable" @click="goToTab('classes')">
          <div class="list-header"><h3>الفصول</h3></div>
          <p class="list-empty">{{ school.class_count ?? 0 }} فصل في المدرسة</p>
        </div>

        <div class="list-card clickable" @click="goToTab('reports')">
          <div class="list-header"><h3>التقارير</h3></div>
          <p class="list-empty">{{ school.report_count ?? 0 }} تقرير للمدرسة</p>
        </div>
      </section>
    </template>
    <EmptyState v-else icon="🏫" title="لم يتم اختيار مدرسة" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'
import { eventBus } from '@/composables/shared/useEventBus'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SchoolActionBar from '@/components/admin/SchoolActionBar.vue'

const store = useAdminStore()
const { selectedSchoolId, clearSelectedSchool } = useSelectedSchool()

const school = computed<any>(() => (store.activeSchools as any[]).find((s: any) => s.id === selectedSchoolId.value))

function goBack() { clearSelectedSchool(); eventBus.emit('admin:switch-tab', { tabId: 'schools' }) }
function goToTab(tabId: string) { eventBus.emit('admin:switch-tab', { tabId }) }
async function load() { await store.fetchSchools() }
onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
</style>
