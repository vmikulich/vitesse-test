<script setup lang="ts">
import { useStore } from 'vuex'
import useAuth from '../../use/useAuth'

const auth0Client = ref()
const store = useStore()
const { buildAuth0Client, login, logout } = useAuth()

onMounted(async() => {
  auth0Client.value = await buildAuth0Client()
  console.log(auth0Client.value)
  loginUser()
  if (!auth0Client.value.isAuthenticated) {
    loginUser()
  }
  const userData = await auth0Client.value.getUser()
  store.commit('setUser', userData)
})

async function loginUser() {
  await login(auth0Client.value)
}

function logoutUser() {
  logout(auth0Client.value)
}
</script>

<template>
  <p>home</p>
  <v-btn color="primary">logout</v-btn>
</template>
