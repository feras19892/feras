<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t, tArray } = useI18n()

defineProps<{
  activeFeat: number | null
  featColors: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cta'): void
}>()
</script>

<template>
  <Transition name="panel">
    <div v-if="activeFeat" class="detail-overlay" @click.self="emit('close')">
      <div class="detail-panel" :style="{ '--c': featColors[activeFeat - 1] }">
        <div class="detail-side-bar"></div>
        <button class="detail-close" @click="emit('close')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>

        <div class="detail-top">
          <div class="detail-icon-wrap">
            <div class="detail-icon">{{ t(`landing.feat${activeFeat}Icon`) }}</div>
            <span class="detail-num">{{ String(activeFeat).padStart(2, '0') }}</span>
          </div>
          <div class="detail-top-body">
            <span class="detail-eyebrow">{{ t('landing.heroBadge') }}</span>
            <h2 class="detail-title">{{ t(`landing.feat${activeFeat}Title`) }}</h2>
          </div>
        </div>

        <p class="detail-text">{{ t(`landing.feat${activeFeat}Detail`) }}</p>
        <div class="detail-divider"></div>

        <ul class="detail-points">
          <li v-for="(point, pi) in tArray(`landing.feat${activeFeat}Points`)" :key="pi">
            <span class="detail-point-check">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5L4 8L9 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span>{{ point }}</span>
          </li>
        </ul>

        <button class="detail-action" @click="emit('cta')">
          <span>{{ t('landing.heroCtaLogin') }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.detail-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
.detail-panel {
  position: relative; max-width: 540px; width: 100%; max-height: 88vh; overflow-y: auto;
  padding: 2rem 2rem 1.8rem 2.5rem; border-radius: 24px;
  background: linear-gradient(165deg, #0f172a 0%, #0d1424 100%);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 60px color-mix(in srgb, var(--c) 10%, transparent), inset 0 1px 0 rgba(255,255,255,0.05);
  text-align: start;
}
.detail-panel::-webkit-scrollbar { width: 5px; }
.detail-panel::-webkit-scrollbar-track { background: transparent; }
.detail-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
.detail-side-bar {
  position: absolute; top: 0; bottom: 0; inset-inline-start: 0; width: 5px;
  background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 30%, transparent));
  border-radius: 24px 0 0 24px;
}
.detail-close {
  position: absolute; top: 1rem; inset-inline-end: 1rem; width: 34px; height: 34px;
  border: none; border-radius: 10px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06); color: #64748b; cursor: pointer;
  transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; z-index: 2;
}
.detail-close:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; border-color: rgba(255,255,255,0.15); }
.detail-top { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.4rem; }
.detail-icon-wrap { position: relative; flex-shrink: 0; }
.detail-icon {
  font-size: 1.8rem; width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--c) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 20%, transparent);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--c) 12%, transparent);
}
.detail-num {
  position: absolute; top: -6px; inset-inline-end: -6px; font-size: 0.6rem; font-weight: 800;
  color: var(--c); background: #0f172a; border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
  border-radius: 999px; padding: 1px 6px; letter-spacing: 0.5px;
}
.detail-top-body { flex: 1; padding-top: 0.2rem; }
.detail-eyebrow {
  display: block; font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--c); margin-bottom: 0.3rem; opacity: 0.8;
}
.detail-title { font-size: 1.4rem; font-weight: 800; color: #f1f5f9; margin: 0; line-height: 1.3; }
.detail-text {
  font-size: 0.85rem; color: #94a3b8; line-height: 1.75; margin: 0 0 1.2rem;
  padding: 1rem 1.2rem; border-radius: 14px; background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.04); border-inline-start: 3px solid color-mix(in srgb, var(--c) 40%, transparent);
}
.detail-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); margin: 0 0 1.2rem; }
.detail-points { list-style: none; padding: 0; margin: 0 0 1.6rem; display: flex; flex-direction: column; gap: 0.7rem; }
.detail-points li {
  display: flex; align-items: flex-start; gap: 0.7rem; font-size: 0.82rem; color: #cbd5e1;
  line-height: 1.55; padding: 0.5rem 0.8rem; border-radius: 10px; transition: background 0.2s ease;
}
.detail-points li:hover { background: rgba(255,255,255,0.02); }
.detail-point-check {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; color: var(--c);
  background: color-mix(in srgb, var(--c) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 20%, transparent); margin-top: 1px;
}
.detail-action {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%;
  padding: 0.9rem 1.5rem; border: none; border-radius: 14px;
  background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 70%, #6366f1));
  color: #fff; font-size: 0.9rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s ease; font-family: inherit;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--c) 25%, transparent);
}
.detail-action:hover { transform: translateY(-2px); box-shadow: 0 12px 36px color-mix(in srgb, var(--c) 35%, transparent); }
:global(html[dir='rtl']) .detail-action svg { transform: scaleX(-1); }

.panel-enter-active, .panel-leave-active { transition: opacity 0.3s ease; }
.panel-enter-active .detail-panel, .panel-leave-active .detail-panel { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from .detail-panel { transform: translateY(30px) scale(0.95); opacity: 0; }
.panel-leave-to .detail-panel { transform: translateY(-15px) scale(0.97); opacity: 0; }
</style>
