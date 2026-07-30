<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAnnouncements, deleteAnnouncement, createAnnouncement, type Announcement } from '../../services/announcement.service';
import { useAuthStore } from '../../modules/auth/stores/auth';

const auth = useAuthStore();
const announcements = ref<Announcement[]>([]);
const loading = ref(false);
const showForm = ref(false);
const formData = ref({ title: '', content: '', scope: 'global' as 'global' | 'class' | 'school', is_pinned: false });
const saving = ref(false);

const canCreate = computed(() => auth.user?.role === 'admin' || auth.user?.role === 'teacher');

async function load() {
  loading.value = true;
  try {
    const res = await getAnnouncements();
    if (res.success) announcements.value = res.announcements;
  } catch {
    // ignore
  }
  loading.value = false;
}

async function remove(id: number) {
  await deleteAnnouncement(id);
  announcements.value = announcements.value.filter(a => a.id !== id);
}

async function submit() {
  if (!formData.value.title.trim() || !formData.value.content.trim()) return;
  saving.value = true;
  try {
    const res = await createAnnouncement({
      scope: formData.value.scope,
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      is_pinned: formData.value.is_pinned,
    });
    if (res.success) {
      announcements.value.unshift(res.announcement);
      formData.value = { title: '', content: '', scope: 'global', is_pinned: false };
      showForm.value = false;
    }
  } catch { /* ignore */ }
  saving.value = false;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const canDelete = (a: Announcement) => auth.user?.role === 'admin' || auth.user?.id === a.author_id;

onMounted(load);
</script>

<template>
  <div class="announcements-panel">
    <div class="panel-header">
      <h3>📢 الإعلانات</h3>
      <button v-if="canCreate" class="add-btn" @click="showForm = !showForm">
        {{ showForm ? 'إلغاء' : '+ إعلان جديد' }}
      </button>
    </div>

    <!-- Create Form -->
    <div v-if="showForm && canCreate" class="create-form">
      <input v-model="formData.title" placeholder="عنوان الإعلان" class="form-input" />
      <textarea v-model="formData.content" placeholder="محتوى الإعلان" class="form-textarea" rows="3" />
      <div class="form-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="formData.is_pinned" /> 📌 تثبيت
        </label>
        <button class="submit-btn" :disabled="saving || !formData.title.trim() || !formData.content.trim()" @click="submit">
          {{ saving ? '...' : 'نشر' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="announcements.length === 0" class="empty">لا توجد إعلانات</div>
    <div v-else class="list">
      <div
        v-for="a in announcements"
        :key="a.id"
        :class="['item', { pinned: a.is_pinned }]"
      >
        <div class="item-header">
          <span class="pin" v-if="a.is_pinned">📌</span>
          <span class="scope-tag" :class="a.scope">{{ a.scope === 'global' ? 'عام' : a.scope === 'school' ? 'مدرسة' : 'فصل' }}</span>
          <span class="title">{{ a.title }}</span>
          <button v-if="canDelete(a)" class="del-btn" @click="remove(a.id)">✕</button>
        </div>
        <div class="content">{{ a.content }}</div>
        <div class="meta">
          <span>{{ a.author_name }}</span>
          <span>{{ formatTime(a.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.announcements-panel { padding: 0.5rem; }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.announcements-panel h3 { color: #e2e8f0; margin: 0; font-size: 1rem; }
.add-btn {
  background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2);
  border-radius: 0.4rem; padding: 0.3rem 0.7rem; font-size: 0.78rem; cursor: pointer; font-family: inherit;
}
.add-btn:hover { background: rgba(239,68,68,0.2); }

.create-form {
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.6rem; padding: 0.8rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem;
}
.form-input {
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem;
  padding: 0.5rem 0.7rem; color: #e2e8f0; font-size: 0.85rem; font-family: inherit;
}
.form-textarea {
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem;
  padding: 0.5rem 0.7rem; color: #e2e8f0; font-size: 0.85rem; font-family: inherit; resize: vertical;
}
.form-row { display: flex; align-items: center; justify-content: space-between; }
.checkbox-label { display: flex; align-items: center; gap: 0.3rem; color: #94a3b8; font-size: 0.8rem; cursor: pointer; }
.submit-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none;
  border-radius: 0.4rem; padding: 0.4rem 1.2rem; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.loading, .empty { text-align: center; color: #64748b; padding: 1rem; }
.list { display: flex; flex-direction: column; gap: 0.5rem; }
.item {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem; padding: 0.75rem;
}
.item.pinned { border-color: rgba(250, 204, 21, 0.3); background: rgba(250, 204, 21, 0.05); }
.item-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem; }
.pin { font-size: 0.8rem; }
.scope-tag { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.65rem; font-weight: 700; }
.scope-tag.global { background: rgba(239,68,68,0.15); color: #fca5a5; }
.scope-tag.school { background: rgba(6,182,212,0.15); color: #67e8f9; }
.scope-tag.class { background: rgba(129,140,248,0.15); color: #a5b4fc; }
.title { color: #e2e8f0; font-weight: 600; font-size: 0.85rem; flex: 1; }
.del-btn {
  background: none; border: none; color: #ef4444; cursor: pointer;
  font-size: 0.75rem; padding: 0.1rem 0.3rem;
}
.del-btn:hover { background: rgba(239, 68, 68, 0.1); border-radius: 0.25rem; }
.content { color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin-bottom: 0.3rem; }
.meta { display: flex; justify-content: space-between; color: #64748b; font-size: 0.7rem; }
</style>
