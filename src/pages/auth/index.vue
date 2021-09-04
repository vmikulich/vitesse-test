<template>
  <p>Signing in...</p>
</template>
<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

onMounted(async() => {
  await store.dispatch('auth/handleRedirect')
  router.push('/projects')
})
</script>

<script lang="ts">
export default {
  layout: 'empty',
}
</script>
