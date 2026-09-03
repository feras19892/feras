<template>
  <div class="invoice-list">
    <h2>الفواتير</h2>
    <div class="filters">
      <input v-model="search" placeholder="بحث بالاسم أو البريد..." class="search-input" @input="load" />
      <select v-model="status" class="filter-select" @change="load">
        <option value="">الكل</option>
        <option value="paid">مدفوعة</option>
        <option value="unpaid">غير مدفوعة</option>
        <option value="cancelled">ملغاة</option>
      </select>
      <select v-model="ownerType" class="filter-select" @change="load">
        <option value="">الكل</option>
        <option value="user">مستخدم</option>
        <option value="school">مدرسة</option>
      </select>
    </div>

    <div v-if="loading" class="status">جاري التحميل...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="invoices.length === 0" class="status">لا توجد فواتير.</div>

    <table v-else class="invoice-table">
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>العميل</th>
          <th>النوع</th>
          <th>المبلغ</th>
          <th>الحالة</th>
          <th>طريقة الدفع</th>
          <th>الرقم المرجعي</th>
          <th>تاريخ الدفع</th>
          <th>تحكم</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="invoice in invoices" :key="invoice.id">
          <td>{{ formatDate(invoice.created_at) }}</td>
          <td>{{ invoice.owner_name }}<br><small>{{ invoice.owner_email }}</small></td>
          <td>{{ invoice.owner_type === 'school' ? 'مدرسة' : 'مستخدم' }}</td>
          <td>{{ (invoice.amount_cents / 100).toFixed(2) }} {{ invoice.currency }}</td>
          <td><span :class="['badge', invoice.status]">{{ statusLabel(invoice.status) }}</span></td>
          <td>{{ invoice.payment_provider || '—' }}</td>
          <td><code>{{ invoice.payment_reference || '—' }}</code></td>
          <td>{{ invoice.paid_at ? formatDate(invoice.paid_at) : '—' }}</td>
          <td>
            <select v-model="invoice.status" class="status-select" @change="updateStatus(invoice)">
              <option value="unpaid">غير مدفوعة</option>
              <option value="paid">مدفوعة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page === 1" @click="page-- ; load">السابق</button>
      <span>صفحة {{ page }} من {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="page++ ; load">التالي</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAdminInvoices, updateInvoiceStatus, type AdminInvoice } from '@/services/core/admin-subscriptions.api'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const invoices = ref<AdminInvoice[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const status = ref('')
const ownerType = ref('')
const page = ref(1)
const limit = 20
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit))

function statusLabel(s: string) {
  const labels: Record<string, string> = { paid: 'مدفوعة', unpaid: 'غير مدفوعة', cancelled: 'ملغاة' }
  return labels[s] || s
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('ar-SA')
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getAdminInvoices({
      status: status.value || undefined,
      owner_type: (ownerType.value as any) || undefined,
      search: search.value || undefined,
      page: page.value,
      limit,
    })
    if (res.success) {
      invoices.value = res.invoices
      total.value = res.total
    } else {
      error.value = 'فشل تحميل الفواتير'
    }
  } catch (e) {
    error.value = 'حدث خطأ أثناء تحميل الفواتير'
  } finally {
    loading.value = false
  }
}

async function updateStatus(invoice: AdminInvoice) {
  const res = await updateInvoiceStatus(invoice.id, invoice.status)
  if (res.success) {
    toast.success('تم تحديث الحالة')
    await load()
  } else {
    toast.error('فشل تحديث الحالة')
  }
}

onMounted(load)
</script>

<style scoped>
.invoice-list { padding: 20px; color: #e2e8f0; }
h2 { margin-top: 0; color: #f8fafc; }
.filters { display: flex; gap: 12px; margin-bottom: 16px; }
.search-input, .filter-select, .status-select { padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: #1e293b; color: #e2e8f0; }
.search-input { flex: 1; }
.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #1e293b; border-radius: 8px; overflow: hidden; }
.invoice-table th, .invoice-table td { border: 1px solid #334155; padding: 10px; text-align: right; }
.invoice-table th { background: #334155; color: #f8fafc; }
.invoice-table tr:nth-child(even) { background: #293548; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 700; }
.badge.paid { background: #10b981; color: white; }
.badge.unpaid { background: #f59e0b; color: white; }
.badge.cancelled { background: #ef4444; color: white; }
.status { padding: 20px; text-align: center; color: #6b7280; }
.status.error { color: #ef4444; }
.pagination { display: flex; gap: 12px; align-items: center; justify-content: center; }
.pagination button { padding: 6px 12px; border: none; border-radius: 6px; background: #3b82f6; color: white; cursor: pointer; }
.pagination button:disabled { background: #475569; cursor: not-allowed; }
</style>
