<template>
  <div class="students-inline" @click.stop>
    <SkeletonLoader v-if="loading" type="list" :count="3" />
    <div v-else-if="students.length">
      <div v-if="stats" class="class-stats-bar">
        <div class="cs-stat"><span class="cs-stat__value">{{ stats.total_reports ?? 0 }}</span><span class="cs-stat__label">تقارير</span></div>
        <div class="cs-stat"><span class="cs-stat__value">{{ stats.graded_reports ?? 0 }}</span><span class="cs-stat__label">مصحّح</span></div>
        <div class="cs-stat"><span class="cs-stat__value">{{ Math.round(stats.avg_grade ?? 0) }}%</span><span class="cs-stat__label">المتوسط</span></div>
        <div class="cs-stat"><span class="cs-stat__value">{{ stats.active_students ?? students.length }}</span><span class="cs-stat__label">طلاب نشطون</span></div>
      </div>
      <div class="sort-bar">
        <input v-model="search" class="search-input" placeholder="🔍 بحث بالاسم..." />
        <button class="sort-btn" :class="{ active: sortBy === 'name' }" @click="sortBy = 'name'">🔤 أبجدي</button>
        <button class="sort-btn" :class="{ active: sortBy === 'good' }" @click="sortBy = 'good'">⭐ الأفضل</button>
        <button class="sort-btn" :class="{ active: sortBy === 'bad' }" @click="sortBy = 'bad'">⚠️ عقوبات</button>
        <button class="sort-btn" :class="{ active: sortBy === 'badges' }" @click="sortBy = 'badges'">🏆 أوسمة</button>
      </div>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>الاسم</th><th>التقييم</th><th>تاريخ الانضمام</th></tr></thead>
          <tbody>
            <tr v-for="s in sortedStudents" :key="s.id" class="student-row" :class="{ frozen: !!s.blocked_at }" @click="emit('open-profile', s.id)">
              <td><strong>{{ s.name }}</strong><span class="freeze-icon" :class="{ frozen: !!s.blocked_at }" :title="s.blocked_at ? 'طالب مجمد' : 'طالب نشط'">{{ s.blocked_at ? '🔒' : '🔓' }}</span></td>
              <td class="rating-icons">
                <span v-if="s.reward_count > 0" class="ri-good" :title="`مكافآت: ${s.reward_count}`">🏆{{ s.reward_count }}</span>
                <span v-if="s.badge_count > 0" class="ri-badge" :title="`أوسمة: ${s.badge_count}`">⭐{{ s.badge_count }}</span>
                <span v-if="s.penalty_count > 0" class="ri-penalty" :title="`عقوبات: ${s.penalty_count}`">⚠️{{ s.penalty_count }}</span>
                <span v-if="s.total_points !== 0" class="ri-points" :class="s.total_points > 0 ? 'positive' : 'negative'" title="النقاط">{{ s.total_points > 0 ? '+' : '' }}{{ s.total_points }}</span>
                <span v-if="s.penalty_count === 0 && s.reward_count === 0 && s.badge_count === 0" class="ri-neutral">—</span>
              </td>
              <td>{{ formatDate(s.joined_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <EmptyState v-else icon="👥" title="لا يوجد طلاب" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as teacherApi from '@/services/core/teacher.api'
import type { TeacherClassStudent } from '@/services/core/teacher.api'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ classId: string }>()
const emit = defineEmits<{ 'open-profile': [studentId: number] }>()

const toast = useToast()
const students = ref<TeacherClassStudent[]>([])
const loading = ref(false)
const stats = ref<any>(null)
const search = ref('')
const sortBy = ref<'name' | 'good' | 'bad' | 'badges'>('name')

const sortedStudents = computed(() => {
  let list = [...students.value]
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(q))
  }
  if (sortBy.value === 'name') return list.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  if (sortBy.value === 'good') return list.sort((a, b) => (b.reward_count + b.badge_count + b.total_points) - (a.reward_count + a.badge_count + a.total_points))
  if (sortBy.value === 'bad') return list.sort((a, b) => b.penalty_count - a.penalty_count || a.total_points - b.total_points)
  if (sortBy.value === 'badges') return list.sort((a, b) => b.badge_count - a.badge_count || b.reward_count - a.reward_count)
  return list
})

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}

async function load() {
  loading.value = true
  stats.value = null
  try {
    const [stuRes, statRes] = await Promise.all([
      teacherApi.getClassStudents(props.classId),
      teacherApi.getClassStats(props.classId),
    ])
    if (stuRes.success) students.value = stuRes.students
    if (statRes.success) stats.value = statRes.stats
  } catch (e: any) {
    toast.error(e?.message || 'فشل تحميل الطلاب')
  } finally { loading.value = false }
}

watch(() => props.classId, load, { immediate: true })

defineExpose({ reload: load })
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
</style>
