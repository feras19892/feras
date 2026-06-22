<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import ClassManager from '../components/teacher/ClassManager.vue'
import StudentClasses from '../components/home/StudentClasses.vue'
import TeacherGrading from '../components/teacher/TeacherGrading.vue'
import TeacherStats from '../components/teacher/TeacherStats.vue'
import StudentReports from '../components/student/StudentReports.vue'
import StudentProfile from '../components/student/StudentProfile.vue'
import { fetchHomeCards } from '../services/home.service'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const activeTab = ref('branches')
const cards = ref<HomeCard[]>([])
const loading = ref(false)

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

const goToBranch = (branchId: string) => {
  if (branchId === 'physics') router.push('/physics')
  else if (branchId === 'chemistry') router.push('/chemistry')
}

const loadCards = async () => {
  loading.value = true
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ } finally { loading.value = false }
}

onMounted(async () => {
  if (auth.isTeacher || auth.isAdmin) activeTab.value = 'experiments'
  else if (auth.isStudent) activeTab.value = 'branches'
  if (!auth.user && !auth.isGuest) { await auth.fetchMe() }
  await loadCards()
})
</script>

<template>
  <div class="home-page">
    <AppNavbar v-model:active-tab="activeTab" />

    <main class="main-content">
      <ClassManager v-if="(auth.isTeacher || auth.isAdmin) && activeTab === 'classes'" />
      <StudentClasses v-else-if="auth.isStudent && activeTab === 'classes'" />

      <!-- Teacher & Admin tabs -->
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
      <TeacherGrading v-else-if="(auth.isTeacher || auth.isAdmin) && activeTab === 'grading'" />
      <TeacherStats v-else-if="(auth.isTeacher || auth.isAdmin) && activeTab === 'stats'" />

      <StudentReports v-else-if="auth.isStudent && activeTab === 'reports'" />
      <StudentProfile v-else-if="auth.isStudent && activeTab === 'profile'" />

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
