import { useStore } from 'vuex'

export default () => {
  const store = useStore()

  const isGranted = computed<boolean>(() => store.getters['auth/isGranted'])

  const logout = (): void => {
    store.dispatch('auth/logout')
  }

  const checkAuthentication = async(token: string|null): Promise<void> => {
    await store.dispatch('auth/checkAuthentication', token)
  }

  const login = async(): Promise<void> => {
    await store.dispatch('auth/login')
  }

  return {
    isGranted,
    logout,
    login,
    checkAuthentication,
  }
}
