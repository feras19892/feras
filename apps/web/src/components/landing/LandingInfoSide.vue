<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

defineProps<{
  featColors: string[]
}>()

const emit = defineEmits<{
  (e: 'featClick', index: number): void
  (e: 'showFeedback'): void
}>()

const subjectChips = computed(() =>
  t('landing.subjects').split('—').map(s => s.trim()).filter(Boolean)
)
</script>

<template>
  <div class="info-side">
    <div class="info-bg">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
      <div class="grid-lines"></div>
      <div class="vignette"></div>
    </div>

    <div class="info-content">
      <div class="brand fade-up">
        <span class="brand-mark">
          <span class="brand-ring"></span>
          <span class="brand-icon">⚛️</span>
        </span>
        <span class="brand-text">PhysLab</span>
      </div>

      <div class="badge fade-up" style="--d: 1">
        <span class="badge-dot"></span>
        {{ t('landing.heroBadge') }}
      </div>

      <h1 class="title fade-up" style="--d: 2">{{ t('landing.heroTitle') }}</h1>
      <p class="subtitle fade-up" style="--d: 3">{{ t('landing.heroSubtitle') }}</p>

      <div class="subject-strip fade-up" style="--d: 4">
        <span v-for="(chip, i) in subjectChips" :key="i" class="subject-chip">{{ chip }}</span>
      </div>

      <div class="feats fade-up" style="--d: 5">
        <button
          v-for="i in 6" :key="i" class="feat"
          :style="{ '--c': featColors[i-1] }"
          @click="emit('featClick', i)"
        >
          <span class="feat-icon-badge"><span class="feat-icon">{{ t(`landing.feat${i}Icon`) }}</span></span>
          <div class="feat-body">
            <h3 class="feat-title">{{ t(`landing.feat${i}Title`) }}</h3>
            <p class="feat-desc">{{ t(`landing.feat${i}Desc`) }}</p>
          </div>
          <span class="feat-arrow">›</span>
        </button>
      </div>

      <div class="stats-strip fade-up" style="--d: 6">
        <div class="stat-item"><span class="stat-num">{{ t('landing.statsExperimentsNum') }}</span><span class="stat-label">{{ t('landing.statsExperiments') }}</span></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><span class="stat-num">{{ t('landing.statsStudentsNum') }}</span><span class="stat-label">{{ t('landing.statsStudents') }}</span></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><span class="stat-num">{{ t('landing.statsSchoolsNum') }}</span><span class="stat-label">{{ t('landing.statsSchools') }}</span></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><span class="stat-num">{{ t('landing.statsSubjectsNum') }}</span><span class="stat-label">{{ t('landing.statsSubjects') }}</span></div>
      </div>

      <div class="why-us fade-up" style="--d: 7">
        <h3 class="section-title">{{ t('landing.whyUsTitle') }}</h3>
        <p class="section-subtitle">{{ t('landing.whyUsSubtitle') }}</p>
        <div class="why-us-grid">
          <div class="why-us-card" v-for="i in 4" :key="i">
            <span class="why-us-icon">{{ t(`landing.whyUs${i}Icon`) }}</span>
            <h4 class="why-us-title">{{ t(`landing.whyUs${i}Title`) }}</h4>
            <p class="why-us-desc">{{ t(`landing.whyUs${i}Desc`) }}</p>
          </div>
        </div>
      </div>

      <div class="how-to fade-up" style="--d: 8">
        <h3 class="section-title">{{ t('landing.howToTitle') }}</h3>
        <p class="section-subtitle">{{ t('landing.howToSubtitle') }}</p>
        <div class="steps-list">
          <div class="step-item" v-for="i in 4" :key="i">
            <span class="step-num">{{ i }}</span>
            <div class="step-body">
              <h4 class="step-title">{{ t(`landing.step${i}Title`) }}</h4>
              <p class="step-desc">{{ t(`landing.step${i}Desc`) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section fade-up" style="--d: 9">
        <h3 class="cta-title">{{ t('landing.ctaTitle') }}</h3>
        <p class="cta-subtitle">{{ t('landing.ctaSubtitle') }}</p>
      </div>

      <div class="contact-line fade-up" style="--d: 10">
        <button class="contact-chip" @click="emit('showFeedback')">
          <span class="contact-chip-icon">💬</span>{{ t('landing.contactTelegram') }}
        </button>
        <a href="mailto:support@physlab.app" class="contact-chip">
          <span class="contact-chip-icon">📧</span>{{ t('landing.contactEmail') }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-side {
  flex: 1.2; direction: ltr; position: relative; overflow-y: auto;
  padding: 2rem 2.5rem; display: flex; flex-direction: column;
  border-inline-end: 1px solid rgba(255,255,255,0.06);
}
.info-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.grid-lines {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%);
}
.aurora { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.18; animation: float 16s ease-in-out infinite; }
.aurora-1 { width: 340px; height: 340px; background: #3b82f6; top: 8%; left: 3%; }
.aurora-2 { width: 300px; height: 300px; background: #8b5cf6; bottom: 12%; right: 8%; animation-delay: -5s; }
.aurora-3 { width: 260px; height: 260px; background: #06b6d4; top: 45%; left: 50%; animation-delay: -9s; }
@keyframes float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-25px) scale(1.08); } }
.vignette { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 80% at 50% 50%, transparent 40%, rgba(10,15,28,0.6) 100%); pointer-events: none; }

.fade-up { opacity: 0; transform: translateY(16px); animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: calc(var(--d, 0) * 0.12s); }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

.info-content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1rem; }
.brand { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.brand-mark { position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.brand-ring { position: absolute; inset: 0; border: 2px solid rgba(99,102,241,0.35); border-top-color: rgba(167,139,250,0.6); border-radius: 50%; animation: spin 4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.brand-icon { font-size: 1.2rem; filter: drop-shadow(0 0 8px rgba(99,102,241,0.4)); position: relative; z-index: 1; }
.brand-text { font-size: 1.3rem; font-weight: 700; color: #f1f5f9; letter-spacing: 0.5px; }

.badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.9rem; border-radius: 999px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); font-size: 0.75rem; color: #a5b4fc; font-weight: 500; width: fit-content; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 6px #818cf8; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

.title { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; margin: 0; line-height: 1.2; background: linear-gradient(135deg, #67e8f9, #a78bfa, #f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.subtitle { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; margin: 0; max-width: 480px; }

.subject-strip { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.subject-chip { font-size: 0.72rem; font-weight: 500; color: #a5b4fc; padding: 0.25rem 0.7rem; border-radius: 999px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.12); }

.feats { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
.feat { display: flex; align-items: flex-start; gap: 0.8rem; padding: 0.8rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); transition: all 0.3s ease; cursor: pointer; text-align: start; font-family: inherit; width: 100%; }
.feat:hover { border-color: var(--c); background: color-mix(in srgb, var(--c) 5%, transparent); transform: translateX(4px); }
:global(html[dir='rtl']) .feat:hover { transform: translateX(-4px); }
.feat-icon-badge { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--c) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c) 20%, transparent); flex-shrink: 0; }
.feat-icon { font-size: 1.2rem; line-height: 1; }
.feat-body { flex: 1; }
.feat-title { font-size: 0.88rem; font-weight: 600; margin: 0 0 0.15rem; color: #f1f5f9; }
.feat-desc { font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin: 0; }
.feat-arrow { flex-shrink: 0; font-size: 1.2rem; color: #475569; transition: color 0.3s ease; align-self: center; }
:global(html[dir='rtl']) .feat-arrow { transform: scaleX(-1); }
.feat:hover .feat-arrow { color: var(--c); }

.stats-strip { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 1.2rem 1.5rem; border-radius: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04)); border: 1px solid rgba(99,102,241,0.1); margin-top: 0.5rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; flex: 1; }
.stat-num { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-label { font-size: 0.68rem; color: #94a3b8; text-align: center; }
.stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.08); flex-shrink: 0; }

.section-title { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.3rem; }
.section-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 0 0 1rem; }

.why-us { margin-top: 0.5rem; }
.why-us-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
.why-us-card { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease; }
.why-us-card:hover { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.03); transform: translateY(-2px); }
.why-us-icon { font-size: 1.4rem; display: block; margin-bottom: 0.5rem; }
.why-us-title { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.3rem; }
.why-us-desc { font-size: 0.75rem; color: #94a3b8; line-height: 1.5; margin: 0; }

.how-to { margin-top: 0.5rem; }
.steps-list { display: flex; flex-direction: column; gap: 0.6rem; }
.step-item { display: flex; align-items: flex-start; gap: 0.8rem; padding: 0.8rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); }
.step-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; color: #a5b4fc; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); }
.step-body { flex: 1; }
.step-title { font-size: 0.82rem; font-weight: 600; color: #e2e8f0; margin: 0 0 0.2rem; }
.step-desc { font-size: 0.75rem; color: #94a3b8; line-height: 1.5; margin: 0; }

.cta-section { margin-top: 0.5rem; padding: 1.5rem; border-radius: 18px; text-align: center; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06)); border: 1px solid rgba(99,102,241,0.15); }
.cta-title { font-size: 1.1rem; font-weight: 800; color: #f1f5f9; margin: 0 0 0.4rem; }
.cta-subtitle { font-size: 0.8rem; color: #a5b4fc; margin: 0; }

.contact-line { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
.contact-chip { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #94a3b8; text-decoration: none; padding: 0.35rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); transition: all 0.25s ease; cursor: pointer; background: none; font-family: inherit; }
.contact-chip-icon { font-size: 0.85rem; }
.contact-chip:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }

@media (max-width: 900px) {
  .info-side { border-inline-end: none; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 1.5rem 1.5rem 2rem; }
  .feats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
}
@media (max-width: 600px) {
  .feats { grid-template-columns: 1fr; }
  .why-us-grid { grid-template-columns: 1fr; }
  .stats-strip { flex-wrap: wrap; gap: 0.8rem; }
  .stat-divider { display: none; }
  .stat-item { min-width: 45%; }
}
</style>
