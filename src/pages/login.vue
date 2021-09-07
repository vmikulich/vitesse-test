<template>
  <p>Signing in...</p>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

onMounted(async() => {
  await store.dispatch('auth/login')
})
</script>

<route lang="yaml">
meta:
  layout: empty
</route>
