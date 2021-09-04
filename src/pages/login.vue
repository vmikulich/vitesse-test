<template>
  <p>Signing in...</p>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

onMounted(async() => {
  store.dispatch('auth/login')
})
</script>

<script lang="ts">
export default {
  layout: 'empty',
}
</script>
