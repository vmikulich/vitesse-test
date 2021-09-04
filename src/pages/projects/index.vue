<template>
  <p>home</p>
  <v-btn @click="logout" color="primary">
    logout
  </v-btn>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

function logout() {
  store.dispatch('auth/logout')
}
</script>
