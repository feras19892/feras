<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="help-overlay" @click.self="emit('close')">
      <div class="help-card">
        <div class="help-header">
          <h2>&#x2753; دليل التجربة</h2>
          <button class="close-btn" @click="emit('close')">&#x2715;</button>
        </div>

        <div class="help-body">
          <section class="help-section">
            <h3>&#x1F4DA; تعريف التجربة</h3>
            <p>تجربة النابض تهدف إلى تحديد ثابت النابض <b>k</b> بطريقتين:</p>
            <ul>
              <li><b>الطريقة الاستاتيكية:</b> بتحميل النابض بأوزان معروفة وقياس الاستطالة.</li>
              <li><b>الطريقة الديناميكية:</b> بإطلاق النابض من موضع مبدئي وقياس فترة الاهتزاز.</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>&#x2696;&#xFE0F; قانون هوك (الاستاتيكي)</h3>
            <div class="eq-box">
              <div class="eq-line"><b>F</b> = k · Δy</div>
              <div class="eq-note">Δy = (m · g) / k</div>
              <div class="eq-note">k = (m · g) / Δy</div>
            </div>
            <p class="help-hint">استخدم لوحة <b>"إستاتيكي"</b> لإضافة الأوزان وتسجيل القراءات.</p>
          </section>

          <section class="help-section">
            <h3>&#x1F9EA; الحركة التوافقية البسيطة (الديناميكي)</h3>
            <div class="eq-box">
              <div class="eq-line"><b>T</b> = 2π √(m / k)</div>
              <div class="eq-line"><b>ω₀</b> = √(k / m)</div>
              <div class="eq-line"><b>E</b> = ½ k A²</div>
            </div>
            <p class="help-hint">استخدم <b>"بوابة ضوئية"</b> لعد 20 اهتزازة وقياس الفترة بدقة.</p>
          </section>

          <section class="help-section">
            <h3>&#x1F4CA; طريقة العمل</h3>
            <ol>
              <li>افتح لوحة <b>"إستاتيكي"</b> واضغط "بدء التحميل".</li>
              <li>أضف وزن بـ +50g ثم اضغط "تسجيل" لكل قراءة.</li>
              <li>بعد الانتهاء، اضغط "حساب k" — ستحصل على k الاستاتيكي.</li>
              <li>انتقل لـ <b>"بوابة ضوئية"</b> واضغط "بدء العد".</li>
              <li>عند الوصول لـ 20 اهتزازة، تسجيل القراءة (3 تكرارات).</li>
              <li>افتح <b>"تقرير"</b> لمقارنة k الاستاتيكي والديناميكي.</li>
            </ol>
          </section>

          <section class="help-section">
            <h3>&#x1F4C9; حساب الميل من الرسم</h3>
            <p>في لوحة <b>Scatter</b> اختر المحاور (مثلاً m × T²) ثم اضغط <b>"حساب الميل"</b>:</p>
            <div class="eq-box">
              <div class="eq-line">y = m·x + b</div>
              <div class="eq-note">m = الميل (slope)</div>
              <div class="eq-note">R² = معامل التحديد</div>
            </div>
          </section>

          <section class="help-section">
            <h3>&#x1F4BE; ازرار التحكم</h3>
            <div class="btn-help-grid">
              <div class="btn-help-row"><span class="btn-tag primary">▶️ بدء</span><span>تشغيل/إيقاف المحاكاة</span></div>
              <div class="btn-help-row"><span class="btn-tag">&#x1F504; إعادة</span><span>إعادة تعيين المحاكاة</span></div>
              <div class="btn-help-row"><span class="btn-tag">&#x1F4CC; تسجيل</span><span>تسجيل قياس حالي</span></div>
              <div class="btn-help-row"><span class="btn-tag speed">&#x1F40D; ×1.0</span><span>تغيير سرعة المحاكاة</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:99999; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
.help-card { background:#1E2530; border:1px solid #2D3645; border-radius:12px; width:92vw; max-width:640px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,.5); }
.help-header { display:flex; justify-content:space-between; align-items:center; padding:.8rem 1rem; border-bottom:1px solid #2D3645; background:rgba(91,141,184,.06); flex-shrink:0; }
.help-header h2 { margin:0; font-size:1rem; color:#D1D7E0; }
.close-btn { background:transparent; border:1px solid #2D3645; color:#8B95A5; border-radius:6px; width:28px; height:28px; cursor:pointer; font-size:.8rem; }
.close-btn:hover { background:rgba(91,141,184,.1); color:#D1D7E0; }
.help-body { overflow-y:auto; padding:1rem 1.2rem; font-size:.78rem; color:#B8C0CC; line-height:1.7; }
.help-section { margin-bottom:1.2rem; }
.help-section h3 { margin:0 0 .4rem; font-size:.82rem; color:#5B8DB8; border-bottom:1px solid #2D3645; padding-bottom:.2rem; }
.help-section p { margin:.3rem 0; }
.help-section ul, .help-section ol { margin:.3rem 0; padding-right:1.2rem; }
.help-section li { margin-bottom:.25rem; }
.eq-box { background:#161B22; border:1px solid #2D3645; border-radius:6px; padding:.5rem .7rem; margin:.4rem 0; font-family:monospace; }
.eq-line { color:#D1D7E0; font-size:.8rem; margin-bottom:.15rem; }
.eq-note { color:#8B95A5; font-size:.72rem; }
.help-hint { color:#4ade80; font-size:.72rem; margin-top:.3rem; }
.btn-help-grid { display:flex; flex-direction:column; gap:.3rem; margin-top:.3rem; }
.btn-help-row { display:flex; align-items:center; gap:.5rem; padding:.25rem .4rem; background:#161B22; border-radius:4px; border:1px solid #2D3645; }
.btn-tag { background:#252D3A; border:1px solid #2D3645; color:#8B95A5; border-radius:4px; padding:.15rem .35rem; font-size:.68rem; font-family:monospace; min-width:70px; text-align:center; }
.btn-tag.primary { color:#5B8DB8; border-color:rgba(91,141,184,.3); }
.btn-tag.speed { color:#fbbf24; border-color:rgba(251,191,36,.3); }
</style>
