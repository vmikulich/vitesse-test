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
const message = ref('')
const color = ref('')

watch(
  () => store.getters['snackbar/snackbarData'],
  (newValue, oldValue) => {
    const { message, color } = newValue.data
    if (message) {
      show.value = true
      message.value = message

      color.value = color
      store.commit('snackbar/reset')
    }
  },
)
</script>
