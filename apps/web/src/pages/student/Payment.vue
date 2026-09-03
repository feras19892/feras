<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/stores/auth'
import PaymentFlow from '@/components/shared/PaymentFlow.vue'

const auth = useAuthStore()
</script>

<template>
  <PaymentFlow
    v-if="auth.user"
    :owner-id="auth.user.id"
    owner-type="user"
    back-route="/student/billing"
    success-route="/student/billing"
  />
</template>
