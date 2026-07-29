<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAnnouncements, deleteAnnouncement, type Announcement } from '../../services/announcement.service';
import { useAuthStore } from '../../modules/auth/stores/auth';

const auth = useAuthStore();
const announcements = ref<Announcement[]>([]);
const loading = ref(false);

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

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const canDelete = (a: Announcement) => auth.user?.role === 'admin' || auth.user?.id === a.author_id;

onMounted(load);
</script>

<template>
  <div class="announcements-panel">
    <h3>📢 الإعلانات</h3>
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
.announcements-panel h3 { color: #e2e8f0; margin-bottom: 0.75rem; font-size: 1rem; }
.loading, .empty { text-align: center; color: #64748b; padding: 1rem; }
.list { display: flex; flex-direction: column; gap: 0.5rem; }
.item {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem; padding: 0.75rem;
}
.item.pinned { border-color: rgba(250, 204, 21, 0.3); background: rgba(250, 204, 21, 0.05); }
.item-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem; }
.pin { font-size: 0.8rem; }
.title { color: #e2e8f0; font-weight: 600; font-size: 0.85rem; flex: 1; }
.del-btn {
  background: none; border: none; color: #ef4444; cursor: pointer;
  font-size: 0.75rem; padding: 0.1rem 0.3rem;
}
.del-btn:hover { background: rgba(239, 68, 68, 0.1); border-radius: 0.25rem; }
.content { color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin-bottom: 0.3rem; }
.meta { display: flex; justify-content: space-between; color: #64748b; font-size: 0.7rem; }
</style>
