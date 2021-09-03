<script setup lang="ts">
const redirectTimeout = ref()
redirectTimeout.value = setTimeout(() => this.$auth.loginWith('auth0'), 1000)
onBeforeUnmount(() => {
  clearTimeout(redirectTimeout.value)
})
</script>

<template>
  <p>Signing out...</p>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
<script>
export default {
  auth: false,
  layout: 'empty',
  data() {
    return {
      redirectTimeout: null,
    }
  },
  created() {
    this.redirectTimeout = setTimeout(() => this.$auth.loginWith('auth0'), 1000)
  },
  beforeDestroy() {
    clearTimeout(this.redirectTimeout)
  },
}
</script>
