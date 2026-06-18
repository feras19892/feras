<script setup lang="ts">
interface Props {
  id: string;
  icon: string;
  title: string;
  desc: string;
  stats: string;
  action?: () => void;
}

defineProps<Props>();
</script>

<template>
  <div :class="['card', id]" @click="action">
    <div class="card-glow"></div>
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p v-if="desc" class="card-desc">{{ desc }}</p>
    <div v-if="stats" class="card-stats">
      <span>📊</span>
      <span>{{ stats }}</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 220px;
  height: 260px;
  background: rgba(255, 255, 255, 0.04);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  opacity: 0;
  animation: fadeInUp 0.7s ease-out forwards;
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card:hover {
  transform: translateY(-12px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(255, 255, 255, 0.03);
}
.card:hover .card-glow { opacity: 0.25; }

.physics .card-glow { background: #3B82F6; }
.physics:hover { border-color: rgba(59,130,246,0.4); }

.chemistry .card-glow { background: #10B981; }
.chemistry:hover { border-color: rgba(16,185,129,0.4); }

.mathematics .card-glow { background: #EC4899; }
.mathematics:hover { border-color: rgba(236,72,153,0.4); }

.general .card-glow { background: #F97316; }
.general:hover { border-color: rgba(249,115,22,0.4); }

.card-icon {
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  transition: all 0.35s ease;
}

.card:hover .card-icon {
  transform: scale(1.15) rotate(-5deg);
}

.card-title { font-size: 1.3rem; font-weight: 700; margin: 0; color: #f1f5f9; }
.card-desc { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-top: 0.6rem; line-height: 1.5; }
.card-stats {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.8rem;
  color: rgba(255,255,255,0.5);
  font-size: 0.82rem;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
  .card { width: 100%; max-width: 280px; height: 240px; }
  .card-icon { font-size: 2.4rem; }
}
</style>
