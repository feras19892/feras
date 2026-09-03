<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const LAWS = [
  { law: 'KCL', name: 'قانون العقدة', desc: 'مجموع التيارات الداخلة = مجموع التيارات الخارجة', color: '#4ade80', formula: 'ΣI(in) = ΣI(out)' },
  { law: 'KVL', name: 'قانون الحلقة', desc: 'مجموع فروق الجهد في حلقة مغلقة = صفر', color: '#fbbf24', formula: 'ΣV = 0' },
]

const STEPS = [
  { n: 1, text: 'حدد العقد والحلقات في الدائرة' },
  { n: 2, text: 'افترض اتجاه التيارات في كل فرع' },
  { n: 3, text: 'اكتب معادلة KCL عند كل عقدة' },
  { n: 4, text: 'اكتب معادلة KVL لكل حلقة مستقلة' },
  { n: 5, text: 'حل المعادلات لإيجاد التيارات المجهولة' },
  { n: 6, text: 'تحقق من صحة الحل بالتعويض' },
]

const SIGNS = [
  { sign: '+', desc: 'البطارية: من القطب السالب إلى الموجب', color: '#22c55e' },
  { sign: '−', desc: 'المقاومة: في اتجاه التيار (هبوط جهد)', color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">⚡ قانونا كيرشوف</div>

    <div class="ref-table">
      <div class="ref-header">
        <span>القانون</span>
        <span>المعادلة</span>
      </div>
      <div v-for="law in LAWS" :key="law.law" class="ref-row">
        <div class="law-info">
          <span :style="{ color: law.color, fontWeight: 700 }">{{ law.law }}</span>
          <span class="law-name">{{ law.name }}</span>
        </div>
        <span class="law-formula" :style="{ color: law.color }">{{ law.formula }}</span>
      </div>
      <div v-for="law in LAWS" :key="law.law + '-desc'" class="ref-desc">
        {{ law.desc }}
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">إشارات الجهد في KVL</div>
      <div v-for="s in SIGNS" :key="s.sign" class="sign-row">
        <span class="sign" :style="{ color: s.color }">{{ s.sign }}</span>
        <span>{{ s.desc }}</span>
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">خطوات الحل</div>
      <ol class="steps-list">
        <li v-for="s in STEPS" :key="s.n">{{ s.text }}</li>
      </ol>
    </div>

    <div class="ref-note">
      📐 عدد المعادلات = عدد الحلقات المستقلة + (عدد العقد − 1)
    </div>
    <div class="ref-note">
      ⚡ في دائرتين بحلقتين: معادلة KCL واحدة + معادلتان KVL = 3 معادلات لـ 3 مجاهيل
    </div>
    <div class="ref-note">
      ⚠️ إذا كانت قيمة التيار سالبة، فإن الاتجاه الفعلي عكس الاتجاه المفترض
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .15rem; }
.ref-header { display: flex; justify-content: space-between; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .78rem; color: #94a3b8; }
.ref-row { display: flex; justify-content: space-between; align-items: center; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .78rem; gap: .5rem; }
.law-info { display: flex; flex-direction: column; gap: .1rem; }
.law-name { font-size: .72rem; color: #64748b; }
.law-formula { font-family: 'Courier New', monospace; font-weight: 700; font-size: .8rem; }
.ref-desc { font-size: .72rem; color: #94a3b8; padding: .2rem .6rem; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.sign-row { display: flex; align-items: center; gap: .4rem; font-size: .75rem; color: #cbd5e1; padding: .15rem 0; }
.sign { font-size: 1rem; font-weight: 700; width: 1.2rem; text-align: center; }
.steps-list { margin: 0; padding-inline-start: 1.2rem; padding-inline-start: 0; }
.steps-list li { font-size: .75rem; color: #cbd5e1; line-height: 1.6; margin-bottom: .15rem; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>