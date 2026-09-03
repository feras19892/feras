<template>
  <div class="dash-page">
    <h2>{{ props.title || t('dashboard.dashNew.users') }}</h2>
    <FilterBar :filters="filterConfigs" :search="true" @change="onFilterChange" />
    <div class="toolbar-right">
      <SendAlertButton v-if="props.role" :role="props.role" />
      <button @click="showAddModal = true" class="btn-add">{{ t('dashboard.dashNew.addUser') }}</button>
      <button @click="handleExport" class="btn-export">{{ t('dashboard.dashNew.exportCsv') }}</button>
    </div>
    <SkeletonLoader v-if="store.loading" type="table" :count="5" />
    <ErrorState v-else-if="store.error" :error="store.error" show-retry @retry="load" />
    <div v-else-if="filteredUsers.length" class="compact-list">
      <div v-for="user in pagedUsers" :key="user.id" class="compact-row">
        <span class="cr-icon">👤</span>
        <span class="cr-name">{{ user.name }}</span>
        <span class="cr-meta">
          <span>{{ roleLabel(user.role) }}</span>
          <span :class="['status-badge', user.blocked_at ? 'blocked' : 'active']">
            {{ user.blocked_at ? t('dashboard.dashNew.blocked') : t('dashboard.dashNew.active') }}
          </span>
        </span>
        <span class="cr-action">
          <ActionMenu
            :items="user.blocked_at
              ? [{ label: t('dashboard.dashNew.unblock'), icon: '✅', variant: 'success', emit: 'unblock' }, { label: t('dashboard.dashNew.delete'), icon: '🗑️', variant: 'danger', emit: 'delete' }]
              : [{ label: t('dashboard.dashNew.block'), icon: '🚫', variant: 'danger', emit: 'block' }, { label: t('dashboard.dashNew.delete'), icon: '🗑️', variant: 'danger', emit: 'delete' }]"
            @action="(key) => onUserAction(key, user)"
          />
        </span>
      </div>
    </div>
    <EmptyState v-else icon="👤" :title="t('dashboard.dashNew.noUsers')" />
    <Pagination
      v-if="filteredUsers.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredUsers.length"
      @change="onPageChange"
    />

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>{{ t('dashboard.dashNew.addNewUser') }}</h3>
        <div class="form-group"><label>{{ t('dashboard.dashNew.name2') }}</label><input v-model="newUser.name" class="form-input" /></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.email2') }}</label><input v-model="newUser.email" class="form-input" /></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.password') }}</label><input v-model="newUser.password" type="password" class="form-input" /></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.role') }}</label>
          <select v-model="newUser.role" class="form-input">
            <option value="student">{{ t('dashboard.dashNew.studentRole') }}</option><option value="teacher">{{ t('dashboard.dashNew.teacherRole') }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="handleAddUser" class="btn-sm btn-success" :disabled="adding">{{ adding ? '...' : t('dashboard.dashNew.add2') }}</button>
          <button @click="showAddModal = false" class="btn-sm btn-warn">{{ t('dashboard.dashNew.cancel') }}</button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="blockTarget !== null"
      icon="🚫"
      :title="t('dashboard.dashNew.confirmBlockTitle')"
      :message="blockTarget ? t('dashboard.dashNew.confirmBlockMsg', { name: blockTarget.name }) : ''"
      :confirm-label="t('dashboard.dashNew.block')"
      :cancel-label="t('dashboard.dashNew.cancel')"
      variant="danger"
      :loading="blockLoading"
      @confirm="confirmBlock"
      @cancel="blockTarget = null"
    />
    <ConfirmModal
      :open="unblockTarget !== null"
      icon="✅"
      :title="t('dashboard.dashNew.confirmUnblockTitle')"
      :message="unblockTarget ? t('dashboard.dashNew.confirmUnblockMsg', { name: unblockTarget.name }) : ''"
      :confirm-label="t('dashboard.dashNew.unblock')"
      :cancel-label="t('dashboard.dashNew.retreat')"
      variant="success"
      :loading="unblockLoading"
      @confirm="confirmUnblock"
      @cancel="unblockTarget = null"
    />
    <ConfirmModal
      :open="deleteTarget !== null"
      icon="🗑️"
      :title="t('dashboard.dashNew.confirmDeleteUserTitle')"
      :message="deleteTarget ? t('dashboard.dashNew.confirmDeleteUserMsg', { name: deleteTarget.name }) : ''"
      :confirm-label="t('dashboard.dashNew.delete')"
      :cancel-label="t('dashboard.dashNew.cancel')"
      variant="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, onMounted } from 'vue'
import { useSchoolStore } from '@/stores/school.store'
import * as schoolApi from '@/services/core/school.api'
import FilterBar, { type FilterConfig } from '@/components/shared/FilterBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ActionMenu from '@/components/shared/ActionMenu.vue'
import SendAlertButton from '@/components/shared/SendAlertButton.vue'
import Pagination from '@/components/shared/Pagination.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import { exportToCSV } from '@/composables/shared/useExport'
import { useToast } from '@/composables/useToast'
import { eventBus } from '@/composables/shared/useEventBus'

const props = defineProps<{ role?: 'teacher' | 'student'; title?: string }>()

const store = useSchoolStore()

const toast = useToast()
const search = ref('')
const roleFilter = ref<string>(props.role || '')
const currentPage = ref(1)
const pageLimit = ref(10)
const showAddModal = ref(false)
const adding = ref(false)
const newUser = ref({ name: '', email: '', password: '', role: props.role || 'student' })
const blockTarget = ref<{ id: number; name: string } | null>(null)
const blockLoading = ref(false)
const unblockTarget = ref<{ id: number; name: string } | null>(null)
const unblockLoading = ref(false)
const deleteTarget = ref<{ id: number; name: string } | null>(null)
const deleteLoading = ref(false)

const filterConfigs = computed<FilterConfig[]>(() =>
  props.role ? [] : [
    {
      key: 'role', label: t('dashboard.dashNew.role'),
      options: [
        { value: 'teacher', label: t('dashboard.dashNew.teacherRole') },
        { value: 'student', label: t('dashboard.dashNew.studentRole') },
      ],
    },
  ]
)

function onFilterChange(values: Record<string, string>, searchVal: string) {
  if (!props.role) roleFilter.value = values.role || ''
  search.value = searchVal
  currentPage.value = 1
}

const filteredUsers = computed(() => {
  let result = store.users
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((u: any) =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    )
  }
  if (roleFilter.value) result = result.filter((u: any) => u.role === roleFilter.value)
  return result
})

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredUsers.value.slice(start, start + pageLimit.value)
})

function onPageChange(p: number) {
  currentPage.value = p
}

function roleLabel(role: string) {
  const labels: Record<string, string> = { teacher: t('dashboard.dashNew.teacherRole'), student: t('dashboard.dashNew.studentRole') }
  return labels[role] || role
}

function onUserAction(key: string, user: any) {
  if (key === 'block') requestBlock(user)
  else if (key === 'unblock') requestUnblock(user)
  else if (key === 'delete') requestDelete(user)
}

function requestBlock(user: any) {
  blockTarget.value = { id: user.id, name: user.name }
}

async function confirmBlock() {
  if (!blockTarget.value) return
  blockLoading.value = true
  try {
    await schoolApi.blockUser(blockTarget.value.id)
    eventBus.emit('user:banned', { userId: blockTarget.value.id })
    await store.fetchUsers(true)
    toast.success(t('dashboard.dashNew.blockedSuccessfully'))
    blockTarget.value = null
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.banFailed'))
  } finally { blockLoading.value = false }
}

function requestUnblock(user: any) {
  unblockTarget.value = { id: user.id, name: user.name }
}

async function confirmUnblock() {
  if (!unblockTarget.value) return
  unblockLoading.value = true
  try {
    await schoolApi.unblockUser(unblockTarget.value.id)
    eventBus.emit('user:unbanned', { userId: unblockTarget.value.id })
    await store.fetchUsers(true)
    toast.success(t('dashboard.dashNew.unblockedSuccessfully'))
    unblockTarget.value = null
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.unbanFailed'))
  } finally { unblockLoading.value = false }
}

function requestDelete(user: any) {
  deleteTarget.value = { id: user.id, name: user.name }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await schoolApi.removeUser(deleteTarget.value.id)
    await store.fetchUsers(true)
    toast.success(t('dashboard.dashNew.deletedSuccessfully'))
    deleteTarget.value = null
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.userDeleteFailed'))
  } finally { deleteLoading.value = false }
}

function handleExport() {
  exportToCSV(filteredUsers.value.map((u: any) => ({
    id: u.id, name: u.name, email: u.email, role: u.role,
    status: u.blocked_at ? t('dashboard.dashNew.blocked') : t('dashboard.dashNew.active'),
  })), 'school-users')
}

async function load() {
  await store.fetchUsers(true)
}

async function handleAddUser() {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return
  adding.value = true
  try {
    await schoolApi.createSchoolUser(newUser.value.name, newUser.value.email, newUser.value.password, newUser.value.role)
    await store.fetchUsers(true)
    toast.success(t('dashboard.dashNew.userAddSuccess'))
    showAddModal.value = false
    newUser.value = { name: '', email: '', password: '', role: props.role || 'student' }
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.userAddFailed'))
  } finally { adding.value = false }
}

onMounted(async () => {
  await store.fetchUsers()
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; }
.status-badge.active { background: #dcfce7; color: #16a34a; }
.status-badge.blocked { background: #fee2e2; color: #dc2626; }
</style>
