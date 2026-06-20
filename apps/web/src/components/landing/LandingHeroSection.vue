<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="hero-section">
    <h1 class="hero-title">{{ t('landing.tagline') || 'مختبر العلوم التفاعلي' }}</h1>
    <p class="hero-desc">
      {{ t('landing.descLine1') || 'منصة تعليمية متكاملة للتجارب العلمية' }}<br>
      ⚛️ الفيزياء — 🧪 الكيمياء — 📐 الرياضيات — 🧬 البيولوجيا
    </p>
  </div>
</template>

<style scoped>
.hero-section {
  text-align: center;
  color: #e2e8f0;
  margin-top: 1rem;
}
.hero-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.6rem;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}
.hero-desc {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.8;
  margin: 0;
}
</style>
