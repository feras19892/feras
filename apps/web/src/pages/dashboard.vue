<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import ClassManager from '../components/teacher/ClassManager.vue'
import TeacherGrading from '../components/teacher/TeacherGrading.vue'
import TeacherStats from '../components/teacher/TeacherStats.vue'
import TeacherDashboard from '../components/teacher/TeacherDashboard.vue'
import StudentDashboard from '../components/student/StudentDashboard.vue'
import { fetchHomeCards } from '../services/home.service'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const auth = useAuthStore()

const activeTab = ref('branches')
const cards = ref<HomeCard[]>([])
const loading = ref(false)

const teacherSubPages = ['classes', 'grading', 'stats']
const studentSubPages = ['branches']
const showBackToHome = computed(() =>
  (auth.isTeacher && teacherSubPages.includes(activeTab.value)) ||
  (auth.isStudent && studentSubPages.includes(activeTab.value))
)

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

const goToBranch = (branchId: string) => {
  if (branchId === 'physics') router.push('/physics')
  if (branchId === 'chemistry') router.push('/chemistry')
  if (branchId === 'mathematics') router.push('/math')
  if (branchId === 'general') router.push('/biology')
}

const loadCards = async () => {
  loading.value = true
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ } finally { loading.value = false }
}

onMounted(async () => {
  if (!auth.isGuest) { await auth.fetchMe() }
  if (auth.isAdmin && route.query.view !== 'experiments') { router.push('/admin'); return }
  if (auth.isAdmin) activeTab.value = 'experiments'
  else if (auth.isTeacher) activeTab.value = 'home'
  else if (auth.isStudent) activeTab.value = 'home'
  await loadCards()
})

watch(activeTab, (tab) => {
  if ((tab === 'experiments' || tab === 'branches') && cards.value.length === 0) {
    loadCards()
  }
})
</script>

<template>
  <div class="home-page">
    <AppNavbar v-model:active-tab="activeTab" />

    <main :class="['main-content', { 'full-width': showBackToHome }]">
      <TeacherDashboard v-if="auth.isTeacher && activeTab === 'home'" @navigate="activeTab = $event" />
      <StudentDashboard v-else-if="auth.isStudent && activeTab === 'home'" @navigate="activeTab = $event" />
      <ClassManager v-else-if="auth.isTeacher && activeTab === 'classes'" />

      <!-- Teacher & Admin experiments tabs -->
      <template v-else-if="(auth.isTeacher || auth.isAdmin) && activeTab === 'experiments'">
        <p v-if="loading" class="loading-text">...</p>
        <div v-else class="cards-grid">
          <BranchCard
            v-for="card in translatedCards"
            :key="card.id"
            :id="card.id"
            :icon="card.icon"
            :title="card.title"
            :desc="card.desc"
            :stats="card.stats"
            :action="() => goToBranch(card.branchId)"
          />
        </div>
      </template>
      <TeacherGrading v-else-if="auth.isTeacher && activeTab === 'grading'" />
      <TeacherStats v-else-if="auth.isTeacher && activeTab === 'stats'" />

      <div v-else-if="auth.isStudent && activeTab === 'branches'">
        <p v-if="loading" class="loading-text">...</p>
        <div v-else class="cards-grid">
          <BranchCard
            v-for="card in translatedCards"
            :key="card.id"
            :id="card.id"
            :icon="card.icon"
            :title="card.title"
            :desc="card.desc"
            :stats="card.stats"
            :action="() => goToBranch(card.branchId)"
          />
        </div>
      </div>

      <!-- Default for teacher/admin when on branches or other tabs -->
      <template v-else-if="auth.isTeacher || auth.isAdmin">
        <p v-if="loading" class="loading-text">...</p>
        <div v-else class="cards-grid">
          <BranchCard
            v-for="card in translatedCards"
            :key="card.id"
            :id="card.id"
            :icon="card.icon"
            :title="card.title"
            :desc="card.desc"
            :stats="card.stats"
            :action="() => goToBranch(card.branchId)"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}

.main-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 72px);
  padding: 2rem;
}
.main-content.full-width {
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 1rem 1.5rem;
}
.back-bar {
  width: 100%;
  margin-bottom: 1rem;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.6rem;
  background: rgba(99, 102, 241, 0.08);
  color: #c7d2fe;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.back-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.35);
}
.back-arrow {
  font-size: 1rem;
  transition: transform 0.2s;
}
.back-btn:hover .back-arrow {
  transform: translateX(-3px);
}
.loading-text {
  text-align: center;
  color: #94a3b8;
  font-size: 1.1rem;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  justify-items: center;
  max-width: 1000px;
  width: 100%;
}
.student-reports, .teacher-tab {
  text-align: center;
  color: #64748b;
  padding: 3rem;
}
.teacher-tab h2 { margin: 0 0 1rem; color: #e2e8f0; }
</style>
