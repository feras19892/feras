<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { triggerBackup, listBackups } from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const loading = ref(false)
const backups = ref<{ name: string; size: number; created: string }[]>([])

async function loadBackups() {
  try {
    const res = await listBackups()
    if (res.success) backups.value = res.backups
  } catch { /* ignore */ }
}

async function createBackup() {
  loading.value = true
  try {
    const res = await triggerBackup()
    if (res.success) {
      toast.success('تم إنشاء نسخة احتياطية بنجاح')
      await loadBackups()
    } else {
      toast.error(res.message || 'فشل إنشاء النسخة الاحتياطية')
    }
  } catch {
    toast.error('فشل الاتصال بالخادم')
  } finally {
    loading.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onMounted(loadBackups)
</script>

<template>
  <div class="backup-section">
    <div class="backup-header">
      <h3>النسخ الاحتياطي</h3>
      <button class="btn-backup" :disabled="loading" @click="createBackup">
        {{ loading ? '...' : 'إنشاء نسخة احتياطية' }}
      </button>
    </div>
    <div v-if="backups.length === 0" class="empty">لا توجد نسخ احتياطية</div>
    <table v-else class="backup-table">
      <thead>
        <tr><th>الاسم</th><th>الحجم</th><th>التاريخ</th></tr>
      </thead>
      <tbody>
        <tr v-for="b in backups" :key="b.name">
          <td>{{ b.name }}</td>
          <td>{{ formatSize(b.size) }}</td>
          <td>{{ b.created.slice(0, 19).replace('T', ' ') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.backup-section { color: #e2e8f0; }
.backup-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.backup-header h3 { margin: 0; font-size: 1.1rem; }
.btn-backup { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-family: inherit; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
.btn-backup:disabled { opacity: 0.5; cursor: not-allowed; }
.backup-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.backup-table th { text-align: end; padding: 0.5rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); }
.backup-table td { padding: 0.5rem 0.75rem; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.empty { text-align: center; color: #64748b; padding: 1.5rem; }
</style>
