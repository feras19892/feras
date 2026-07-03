<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../../composables/useI18n'

const router = useRouter()
const { t } = useI18n()

const props = defineProps<{
  title: string
  icon?: string
  experimentRoute?: string
  experimentName?: string
}>()

const emit = defineEmits<{
  (e: 'togglePanel', id: string): void
  (e: 'showAllPanels'): void
  (e: 'exportCsv'): void
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'toggleHelp'): void
  (e: 'analyzeResults'): void
}>()

const activeMenu = ref<string | null>(null)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu(menu: string) { activeMenu.value = activeMenu.value === menu ? null : menu }
function closeMenu() { activeMenu.value = null }
function onMenuClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) closeMenu()
}
onMounted(() => window.addEventListener('click', onMenuClick))
onUnmounted(() => window.removeEventListener('click', onMenuClick))
</script>

<template>
  <nav class="menu-bar" ref="menuRef">
    <div class="menu-left">
      <div class="menu-group">
        <button class="menu-btn" :class="{open:activeMenu==='file'}" @click.stop="toggleMenu('file')">{{ t('experiments.menuFile') }}</button>
        <div v-if="activeMenu==='file'" class="menu-dropdown" @click.stop>
          <div class="menu-row" @click="emit('exportCsv'); closeMenu()"><span class="mi">&#x1F4BE;</span><span>{{ t('experiments.menuExportCsv') }}</span></div>
          <div class="menu-sep" />
          <div class="menu-row restore" @click="emit('showAllPanels'); closeMenu()"><span class="mi">&#x1F504;</span><span>{{ t('experiments.menuRestoreUi') }}</span></div>
        </div>
      </div>
      <div class="menu-group">
        <button class="menu-btn" :class="{open:activeMenu==='view'}" @click.stop="toggleMenu('view')">{{ t('experiments.menuView') }}</button>
        <div v-if="activeMenu==='view'" class="menu-dropdown" @click.stop>
          <div class="menu-row check" @click="emit('togglePanel','readings');"><span class="mi">&#x1F4CB;</span><span>{{ t('experiments.readings') }}</span></div>
          <div class="menu-row check" @click="emit('togglePanel','chart');"><span class="mi">&#x1F4C8;</span><span>{{ t('experiments.chart') }}</span></div>
          <div class="menu-row check" @click="emit('togglePanel','trials');"><span class="mi">&#x1F4CA;</span><span>{{ t('experiments.trials') }}</span></div>
          <div class="menu-row check" @click="emit('togglePanel','params');"><span class="mi">&#x2699;&#xFE0F;</span><span>{{ t('experiments.menuParameters') }}</span></div>
          <div class="menu-row check" @click="emit('togglePanel','laws');"><span class="mi">&#x2696;&#xFE0F;</span><span>{{ t('experiments.laws') }}</span></div>
          <div class="menu-row check" @click="emit('togglePanel','results');"><span class="mi">&#x1F4CB;</span><span>{{ t('experiments.results') }}</span></div>
        </div>
      </div>
    </div>
    <div class="menu-center">{{ icon || '&#x1F4A1;' }} {{ title }}</div>
    <div class="menu-right">
      <div class="menu-group">
        <button v-if="experimentRoute" class="menu-btn" @click="router.push(experimentRoute)">{{ icon || '&#x1F4A1;' }} {{ experimentName || title }}</button>
      </div>
      <div class="menu-group">
        <button class="menu-btn" :class="{open:activeMenu==='run'}" @click.stop="toggleMenu('run')">{{ t('experiments.menuRun') }}</button>
        <div v-if="activeMenu==='run'" class="menu-dropdown" @click.stop>
          <div class="menu-row" @click="emit('togglePause'); closeMenu()"><span class="mi">&#x25B6;</span><span>{{ t('experiments.menuStartStop') }}</span></div>
          <div class="menu-row" @click="emit('reset'); closeMenu()"><span class="mi">&#x1F504;</span><span>{{ t('experiments.menuReset') }}</span></div>
          <div class="menu-row" @click="emit('recordTrial'); closeMenu()"><span class="mi">&#x1F4CC;</span><span>{{ t('experiments.menuRecord') }}</span></div>
        </div>
      </div>
      <div class="menu-group">
        <button class="menu-btn analyze-btn" @click="emit('analyzeResults')">&#x1F4CA; {{ t('experiments.drawingCalculationsSection') }}</button>
      </div>
      <div class="menu-group">
        <button class="menu-btn" @click="emit('toggleHelp')">&#x2753; {{ t('experiments.menuHelp') }}</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.menu-bar { display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; background:linear-gradient(180deg,#1E2530,#161B22); border-bottom:1px solid #2D3645; flex-shrink:0; user-select:none; height:48px; }
.menu-left,.menu-right { display:flex; align-items:center; gap:2px; height:100%; }
.menu-center { font-size:1.05rem; font-weight:800; color:#5B8DB8; white-space:nowrap; pointer-events:none; padding:0 2rem; letter-spacing:.5px; }
.menu-group { position:relative; height:100%; display:flex; align-items:center; }
.menu-btn { padding:0 .7rem; height:100%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.78rem; font-weight:600; transition:all .15s; border-bottom:2px solid transparent; }
.menu-btn:hover { color:#D1D7E0; background:rgba(139,148,158,.06); }
.menu-btn.open { color:#D1D7E0; border-bottom-color:#5B8DB8; background:rgba(91,141,184,.08); }
.menu-dropdown { position:absolute; top:calc(100% + 2px); background:#1A1F27; border:1px solid #2D3645; border-radius:6px; padding:.25rem; min-width:240px; z-index:9999; box-shadow:0 12px 32px rgba(0,0,0,.5); animation:menuIn .1s ease-out; }
.menu-left .menu-dropdown { right:0; left:auto; }
.menu-right .menu-dropdown { left:0; }
@keyframes menuIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
.menu-row { display:flex; align-items:center; gap:.5rem; padding:.4rem .55rem; border-radius:4px; cursor:pointer; font-size:.74rem; color:#B8C0CC; transition:all .12s; margin-bottom:1px; }
.menu-row:hover { background:rgba(91,141,184,.1); color:#D1D7E0; }
.menu-row .mi { width:20px; text-align:center; font-size:.85rem; flex-shrink:0; }
.menu-sep { height:1px; background:#2D3645; margin:.25rem .4rem; }
.menu-row.restore { color:#5B8DB8; font-weight:700; }
.analyze-btn { color:#4ade80 !important; font-weight:700; }
.analyze-btn:hover { background:rgba(34,197,94,.12) !important; }
</style>
