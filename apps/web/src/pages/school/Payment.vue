<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PaymentFlow from '@/components/shared/PaymentFlow.vue'
import { getProfile, type SchoolProfile } from '@/services/core/school.api'

const school = ref<SchoolProfile | null>(null)

onMounted(async () => {
  const res = await getProfile()
  if (res.success) school.value = res.school
})
</script>

<template>
  <PaymentFlow
    v-if="school"
    :owner-id="school.id"
    owner-type="school"
    back-route="/school/billing"
    success-route="/school/billing"
  />
</template>
