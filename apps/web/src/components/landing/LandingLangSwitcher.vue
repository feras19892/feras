<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { locale, setLocale } = useI18n()
</script>

<template>
  <div class="lang-dropdown">
    <select data-testid="lang-switcher" v-model="locale" @change="setLocale(locale)" class="lang-select">
      <option value="ar">🇸🇦 العربية</option>
      <option value="en">🇬🇧 English</option>
      <option value="es">🇪🇸 Español</option>
    </select>
  </div>
</template>

<style scoped>
.lang-dropdown {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
}
:global(html[dir='rtl']) .lang-dropdown {
  right: auto;
  left: 1.5rem;
}
.lang-select {
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  min-width: 120px;
}
.lang-select option {
  background: #1e293b;
  color: #e2e8f0;
}
.lang-select:focus {
  border-color: rgba(99,102,241,0.4);
}
</style>
