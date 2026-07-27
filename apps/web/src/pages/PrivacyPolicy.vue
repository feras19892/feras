<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';

const router = useRouter();
const { t } = useI18n();

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="legal-page">
    <div class="legal-container">
      <button class="back-btn" @click="goHome">← {{ t('legal.back') }}</button>

      <h1>🔒 {{ t('privacy.title') }}</h1>
      <p class="last-updated">{{ t('privacy.lastUpdated') }}</p>

      <section>
        <h2>{{ t('privacy.section1Title') }}</h2>
        <p>{{ t('privacy.section1Body') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.section2Title') }}</h2>
        <p>{{ t('privacy.section2Body') }}</p>
        <ul>
          <li>{{ t('privacy.section2Item1') }}</li>
          <li>{{ t('privacy.section2Item2') }}</li>
          <li>{{ t('privacy.section2Item3') }}</li>
          <li>{{ t('privacy.section2Item4') }}</li>
          <li>{{ t('privacy.section2Item5') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('privacy.section3Title') }}</h2>
        <p>{{ t('privacy.section3Body') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.section4Title') }}</h2>
        <p>{{ t('privacy.section4Body') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.section5Title') }}</h2>
        <p>{{ t('privacy.section5Body') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.section6Title') }}</h2>
        <p>{{ t('privacy.section6Body') }}</p>
        <ul>
          <li>{{ t('privacy.section6Item1') }}</li>
          <li>{{ t('privacy.section6Item2') }}</li>
          <li>{{ t('privacy.section6Item3') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('privacy.section7Title') }}</h2>
        <p>{{ t('privacy.section7Body') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.section8Title') }}</h2>
        <p>{{ t('privacy.section8Body') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.section9Title') }}</h2>
        <p>{{ t('privacy.section9Body') }}</p>
      </section>

      <div class="legal-footer">
        <router-link to="/terms">{{ t('legal.termsLink') }}</router-link>
        <span>·</span>
        <router-link to="/privacy">{{ t('legal.privacyLink') }}</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 2rem 1rem;
}
.legal-container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 2.5rem;
}
.back-btn {
  background: none;
  border: none;
  color: #67e8f9;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  padding: 0;
  font-family: inherit;
}
.back-btn:hover { text-decoration: underline; }
h1 {
  font-size: 1.8rem;
  margin: 0 0 0.3rem;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.last-updated {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0 0 2rem;
}
section { margin-bottom: 1.8rem; }
section h2 {
  font-size: 1.1rem;
  color: #a5b4fc;
  margin: 0 0 0.6rem;
}
section p {
  font-size: 0.88rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin: 0 0 0.5rem;
}
section ul {
  margin: 0.5rem 0;
  padding-inline-start: 1.5rem;
}
section li {
  font-size: 0.85rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin-bottom: 0.3rem;
}
.legal-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  font-size: 0.85rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}
.legal-footer a {
  color: #67e8f9;
  text-decoration: none;
}
.legal-footer a:hover { text-decoration: underline; }
.legal-footer span { color: #475569; }

@media (max-width: 600px) {
  .legal-container { padding: 1.5rem; }
  h1 { font-size: 1.4rem; }
}
</style>
