<template>
  <v-snackbar v-model="show" :top="top" :color="color">
    {{ message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

const show = ref(false)
const top = ref(true)
const message = ref(null)
const color = ref(null)

watch(
  () => store.getters['snackbar/snackbarData'],
  (newValue, oldValue) => {
    if (newValue.message) {
      show.value = true
      message.value = newValue.message

      color.value = newValue.color
      store.commit('snackbar/reset')
    }
  },
)
</script>
