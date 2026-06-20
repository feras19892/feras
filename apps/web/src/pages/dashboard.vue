<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import ClassManager from '../components/teacher/ClassManager.vue'
import StudentClasses from '../components/home/StudentClasses.vue'
import { fetchHomeCards } from '../services/home.service'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('branches')
const cards = ref<HomeCard[]>([])
const loading = ref(false)

const goToBranch = (branchId: string) => {
  if (branchId === 'physics') router.push('/physics')
  else if (branchId === 'chemistry') router.push('/chemistry')
}

const loadCards = async () => {
  loading.value = true
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ } finally { loading.value = false }
}

onMounted(async () => {
  if (auth.token && !auth.user) { await auth.fetchMe() }
  await loadCards()
})
</script>

<template>
  <div class="home-page">
    <AppNavbar v-model:active-tab="activeTab" />

    <main class="main-content">
      <ClassManager v-if="auth.isTeacher && activeTab === 'classes'" />
      <StudentClasses v-else-if="auth.isStudent && activeTab === 'classes'" />

      <!-- Teacher tabs -->
      <template v-else-if="auth.isTeacher && activeTab === 'experiments'">
        <h2 style="text-align:center; color:#e2e8f0; margin:0 0 1.5rem;">📋 التجارب المتاحة</h2>
        <p v-if="loading" class="loading-text">...</p>
        <div v-else class="cards-grid">
          <BranchCard
            v-for="card in cards"
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
      <div v-else-if="auth.isTeacher && activeTab === 'grading'" class="teacher-tab">
        <h2>✅ تصحيح</h2>
        <p>قريباً — تصحيح التقارير</p>
      </div>
      <div v-else-if="auth.isTeacher && activeTab === 'stats'" class="teacher-tab">
        <h2>📊 إحصائيات</h2>
        <p>قريباً — إحصائيات الطلاب</p>
      </div>

      <div v-else-if="auth.isStudent && activeTab === 'reports'" class="student-reports">
        <p>قريباً — تقاريري</p>
      </div>

      <div v-else-if="auth.isStudent && activeTab === 'branches'">
        <p v-if="loading" class="loading-text">...</p>
        <div v-else class="cards-grid">
          <BranchCard
            v-for="card in cards"
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

      <!-- Default for teacher when on branches or other tabs -->
      <template v-else-if="auth.isTeacher">
        <p v-if="loading" class="loading-text">...</p>
        <div v-else class="cards-grid">
          <BranchCard
            v-for="card in cards"
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
