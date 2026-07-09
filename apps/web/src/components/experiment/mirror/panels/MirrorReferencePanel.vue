<script setup lang="ts">
const MIRROR_TYPES = [
  { name: 'مقعر', fSign: '+', image: 'حقيقية/افتراضية حسب do', color: '#22c55e' },
  { name: 'مح_convex', fSign: '-', image: 'افتراضية، منتصبة، مصغرة', color: '#5B8DB8' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 أنواع المرايا</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>النوع</span>
        <span>f</span>
        <span>الصورة</span>
      </div>
      <div v-for="ref in MIRROR_TYPES" :key="ref.name" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.name }}</span>
        <span>{{ ref.fSign }}</span>
        <span>{{ ref.image }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 للمرآة المقعرة: إذا do &gt; f → صورة حقيقية، إذا do &lt; f → صورة افتراضية.
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
.ref-title { font-size: .9rem; font-weight: 700; color: #5B8DB8; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .25rem; }
.ref-header { display: flex; justify-content: space-between; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .8rem; color: #94a3b8; }
.ref-header span { flex: 1; }
.ref-header span:last-child { flex: 2; }
.ref-row { display: flex; justify-content: space-between; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .8rem; }
.ref-row span { flex: 1; }
.ref-row span:last-child { flex: 2; }
.ref-row:last-child { border-bottom: none; }
.ref-note { font-size: .75rem; color: #64748b; margin-top: .5rem; }
</style>
