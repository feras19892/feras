<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineEmits<{

  (e: 'scrollToLogin'): void
  (e: 'scrollToRegister'): void
}>()
</script>

<template>
  <div class="hero-section">
    <div class="hero-bg">
      <div class="hero-orb orb-1"></div>
      <div class="hero-orb orb-2"></div>
      <div class="hero-orb orb-3"></div>
      <div class="hero-grid"></div>
    </div>

    <div class="hero-content">
      <div class="hero-badge">
        <span class="badge-dot"></span>
        {{ t('landing.heroBadge') }}
      </div>
      <h1 class="hero-title">{{ t('landing.heroTitle') }}</h1>
      <p class="hero-subtitle">{{ t('landing.heroSubtitle') }}</p>
      <div class="hero-cta-row">
        <button class="hero-cta primary" @click="$emit('scrollToLogin')">
          {{ t('landing.heroCtaLogin') }}
        </button>
        <button class="hero-cta secondary" @click="$emit('scrollToRegister')">
          {{ t('landing.heroCtaRegister') }}
        </button>
      </div>
      <div class="hero-scroll-hint">
        <span class="scroll-mouse"><span class="scroll-wheel"></span></span>
        <span class="scroll-text">{{ t('landing.heroScroll') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%);
}
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: floatOrb 12s ease-in-out infinite;
}
.orb-1 { width: 400px; height: 400px; background: #3b82f6; top: 10%; left: 5%; }
.orb-2 { width: 350px; height: 350px; background: #8b5cf6; bottom: 15%; right: 10%; animation-delay: -4s; }
.orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 50%; animation-delay: -8s; }

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.1); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 680px;
  padding: 6rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  font-size: 0.8rem;
  color: #a5b4fc;
  font-weight: 500;
  opacity: 0;
  animation: fadeInDown 0.8s ease-out 0.2s forwards;
}
.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 8px #818cf8;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.hero-title {
  font-size: clamp(2.2rem, 6vw, 3.5rem);
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(135deg, #67e8f9 0%, #a78bfa 50%, #f0abfc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.4s forwards;
}
.hero-subtitle {
  font-size: clamp(0.92rem, 2.5vw, 1.1rem);
  color: #94a3b8;
  line-height: 1.8;
  margin: 0;
  max-width: 560px;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.6s forwards;
}
.hero-cta-row {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.5rem;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.8s forwards;
}
.hero-cta {
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.hero-cta.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}
.hero-cta.primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.5);
}
.hero-cta.secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}
.hero-cta.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}
.hero-scroll-hint {
  position: absolute;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  animation: fadeIn 1s ease-out 1.5s forwards;
}
.scroll-mouse {
  width: 22px;
  height: 34px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 5px;
}
.scroll-wheel {
  width: 3px;
  height: 7px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.4);
  animation: scrollWheel 1.8s ease-in-out infinite;
}
@keyframes scrollWheel {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}
.scroll-text { font-size: 0.72rem; color: rgba(255, 255, 255, 0.35); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 640px) {
  .hero-cta-row { flex-direction: column; width: 100%; }
  .hero-cta { width: 100%; }
}
</style>