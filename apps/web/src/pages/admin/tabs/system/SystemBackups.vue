<template>
  <div class="backups-panel">
    <div class="panel-header">
      <h2 class="panel-title">النسخ الاحتياطية</h2>
      <button class="btn btn-primary" @click="handleCreateBackup" :disabled="loading">
        <span v-if="loading">جاري الإنشاء...</span>
        <span v-else>إنشاء نسخة احتياطية</span>
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <div v-if="backups.length === 0 && !loading" class="empty-state">
      <p>لا توجد نسخ احتياطية حالياً</p>
    </div>

    <div v-else class="backups-list">
      <div v-for="backup in backups" :key="backup.name" class="backup-item">
        <div class="backup-info">
          <div class="backup-name">{{ backup.name }}</div>
          <div class="backup-meta">
            <span>{{ formatDate(backup.created_at) }}</span>
            <span>{{ formatFileSize(backup.size) }}</span>
          </div>
        </div>
        <div class="backup-actions">
          <button class="btn btn-sm btn-secondary" @click="handleDownload(backup.name)" title="تحميل">
            ⬇️
          </button>
          <button class="btn btn-sm btn-warning" @click="handleRestore(backup.name)" title="استعادة">
            🔄
          </button>
          <button class="btn btn-sm btn-danger" @click="handleDelete(backup.name)" title="حذف">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <div v-if="showRestoreConfirm" class="modal-overlay" @click="showRestoreConfirm = false">
      <div class="modal" @click.stop>
        <h3>تأكيد الاستعادة</h3>
        <p>هل أنت متأكد من استعادة النسخة الاحتياطية "{{ selectedBackup }}"؟</p>
        <p class="warning">سيتم إنشاء نسخة احتياطية من الحالة الحالية قبل الاستعادة.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showRestoreConfirm = false">إلغاء</button>
          <button class="btn btn-danger" @click="confirmRestore" :disabled="restoring">
            <span v-if="restoring">جاري الاستعادة...</span>
            <span v-else>استعادة</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal" @click.stop>
        <h3>تأكيد الحذف</h3>
        <p>هل أنت متأكد من حذف النسخة الاحتياطية "{{ selectedBackup }}"؟</p>
        <p class="warning">لا يمكن التراجع عن هذا الإجراء.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">إلغاء</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
            <span v-if="deleting">جاري الحذف...</span>
            <span v-else>حذف</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listBackups, createBackup, restoreBackup, downloadBackup, deleteBackup, formatFileSize, formatDate } from '@/services/backup.service';
import type { BackupInfo } from '@/services/backup.service';

const backups = ref<BackupInfo[]>([]);
const loading = ref(false);
const restoring = ref(false);
const deleting = ref(false);
const error = ref('');
const success = ref('');
const showRestoreConfirm = ref(false);
const showDeleteConfirm = ref(false);
const selectedBackup = ref('');

const loadBackups = async () => {
  loading.value = true;
  error.value = '';
  const result = await listBackups();
  loading.value = false;
  
  if (result.success && result.backups) {
    backups.value = result.backups;
  } else {
    error.value = result.message || 'فشل تحميل النسخ الاحتياطية';
  }
};

const handleCreateBackup = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  
  const result = await createBackup();
  loading.value = false;
  
  if (result.success) {
    success.value = result.message || 'تم إنشاء النسخة الاحتياطية بنجاح';
    await loadBackups();
    setTimeout(() => success.value = '', 3000);
  } else {
    error.value = result.message || 'فشل إنشاء النسخة الاحتياطية';
  }
};

const handleDownload = async (backupName: string) => {
  try {
    await downloadBackup(backupName);
    success.value = 'تم تحميل النسخة الاحتياطية بنجاح';
    setTimeout(() => success.value = '', 3000);
  } catch (err: any) {
    error.value = err.message || 'فشل تحميل النسخة الاحتياطية';
  }
};

const handleRestore = (backupName: string) => {
  selectedBackup.value = backupName;
  showRestoreConfirm.value = true;
};

const confirmRestore = async () => {
  restoring.value = true;
  error.value = '';
  success.value = '';
  
  const result = await restoreBackup(selectedBackup.value);
  restoring.value = false;
  showRestoreConfirm.value = false;
  
  if (result.success) {
    success.value = result.message || 'تم استعادة النسخة الاحتياطية بنجاح';
    setTimeout(() => success.value = '', 3000);
    setTimeout(() => location.reload(), 2000);
  } else {
    error.value = result.message || 'فشل استعادة النسخة الاحتياطية';
  }
};

const handleDelete = (backupName: string) => {
  selectedBackup.value = backupName;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  error.value = '';
  success.value = '';
  
  const result = await deleteBackup(selectedBackup.value);
  deleting.value = false;
  showDeleteConfirm.value = false;
  
  if (result.success) {
    success.value = result.message || 'تم حذف النسخة الاحتياطية بنجاح';
    await loadBackups();
    setTimeout(() => success.value = '', 3000);
  } else {
    error.value = result.message || 'فشل حذف النسخة الاحتياطية';
  }
};

onMounted(() => {
  loadBackups();
});
</script>

<style scoped>
.backups-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.8rem;
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-secondary {
  background: rgba(99, 102, 241, 0.1);
  color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.btn-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #cbd5e1;
}

.btn-warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.2);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #cbd5e1;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.6rem;
}

.backups-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.6rem;
  transition: all 0.2s;
}

.backup-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}

.backup-info {
  flex: 1;
}

.backup-name {
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.backup-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

.backup-actions {
  display: flex;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin: 0 0 1rem;
  color: #e2e8f0;
}

.modal p {
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.modal .warning {
  color: #fca5a5;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
