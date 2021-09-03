import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  /**
   * Current named of the user.
   */
  const savedUser = ref(null)

  const authenticated = ref(false)

  /**
   * Changes the current name of the user and saves the one that was used
   * before.
   *
   * @param name - new name to set
   */
  function setUser(user) {
    savedUser.value = user
  }

  function setAuthenticated(status: boolean) {
    authenticated.value = status
  }

  return {
    setUser,
    authenticated,
    savedUser,
    setAuthenticated,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
