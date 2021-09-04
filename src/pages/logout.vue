<template>
  <p>Signing out...</p>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

const redirectTimeout = setTimeout(() => store.dispatch('auth/login'), 1000)

onBeforeUnmount(() => {
  clearTimeout(redirectTimeout)
})

</script>

<route lang="yaml">
meta:
  layout: empty
</route>
