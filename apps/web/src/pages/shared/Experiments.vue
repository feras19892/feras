<script setup lang="ts">
import { branches } from '@/modules/physics/catalog'

const physicsCount = branches.reduce((sum, b) => sum + b.experiments.filter(e => e.enabled).length, 0)

const subjects = [
  { id: 'physics', title: 'الفيزياء', desc: 'تجارب الحركة والقوى والطاقة والموجات والكهرباء والمغناطيسية', color: '#06b6d4', icon: '⚛️', count: physicsCount, route: '/physics' },
  { id: 'chemistry', title: 'الكيمياء', desc: 'تجارب التعيير والترسيب والتفاعلات الحمضية والقاعدية', color: '#10b981', icon: '🧪', count: 8, route: '/chemistry' },
  { id: 'biology', title: 'الأحياء', desc: 'تجارب الخلايا والتشريح والأنسجة والعمليات الحيوية', color: '#f59e0b', icon: '🧬', count: 9, route: '/biology' },
  { id: 'math', title: 'الرياضيات', desc: 'حل المعادلات والجبر والهندسة والتفاضل والتطبيقات', color: '#8b5cf6', icon: '📐', count: 3, route: '/math' },
]
</script>

<template>
  <div class="experiments-page">
    <header class="page-header">
      <h1>🔬 التجارب العلمية</h1>
      <p>اختر المادة التي تريد استكشاف تجاربها</p>
    </header>
    <div class="grid">
      <router-link
        v-for="s in subjects"
        :key="s.id"
        :to="s.route"
        class="card"
        :style="{ borderColor: s.color }"
      >
        <div class="icon" :style="{ background: s.color }">
          {{ s.icon }}
        </div>
        <h3>{{ s.title }}</h3>
        <p class="desc">{{ s.desc }}</p>
        <div class="meta">
          <span class="badge">{{ s.count }} {{ s.count === 1 ? 'تجربة' : 'تجارب' }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.experiments-page {
  min-height: 100%;
  background: #0b1220;
  color: #e2e8f0;
  padding: 2rem 1rem;
  border-radius: 1rem;
}
.page-header { text-align: center; margin-bottom: 2rem; }
.page-header h1 { color: #67e8f9; margin: 0 0 0.5rem; font-size: 1.8rem; }
.page-header p { color: #94a3b8; margin: 0; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  border-left: 4px solid;
  text-decoration: none;
  color: inherit;
}
.card:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,0.07);
}
.icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}
.card h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #f1f5f9; }
.desc { color: #94a3b8; font-size: 0.85rem; margin: 0 0 0.75rem; line-height: 1.5; }
.meta { display: flex; gap: 0.5rem; }
.badge {
  background: rgba(255,255,255,0.08);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #cbd5e1;
}
</style>
