<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <router-view />
    <div class="mt-5 mx-auto text-center opacity-25 text-sm text--secondary">
      [Default Layout]
    </div>
  </main>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

const token = localStorage.getItem('auth0_token')
console.log(token)

store.dispatch('auth/isAuthenticated', token)

const test = ref(store.getters['auth/isGranted'])
console.log(test)

watch(test, (newVal, oldVal) => {
  console.log('eee')
  if (newVal) store.dispatch('user/fetchUser')
})

</script>
