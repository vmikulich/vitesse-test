import createAuth0Client from '@auth0/auth0-spa-js'
import config from '../../config'
import { useStore } from 'vuex'

const useAuth = () => {
  const store = useStore()

  // const authenticated = computed(() => {
  //   return store.authenticated
  // })

  const buildAuth0Client = async() => {
    const client = await createAuth0Client({
      domain: config.auth0Endpoint,
      audience: config.auth0Audience,
      client_id: config.auth0ClientId,
    })

    return client
  }

  const login = async(client) => {
    try {
      await client.loginWithRedirect()
      const user = await client.getUser()
      store.commit('setUser', user)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  // const handleRedirectCallback = async() => {
  //   this.loading = true
  //   try {
  //     await this.auth0Client.handleRedirectCallback()
  //     this.user = await this.auth0Client.getUser()
  //     this.isAuthenticated = true
  //   } catch (e) {
  //     this.error = e
  //   } finally {
  //     this.loading = false
  //   }
  // }
  /** Authenticates the user using the redirect method */
  // const loginWithRedirect = (o) => {
  //   return auth0Client.value.loginWithRedirect(o)
  // }

  // const getIdTokenClaims = (o) => {
  //   return auth0Client.value.getIdTokenClaims(o)
  // }

  const logout = (client) => {
    return client.logout()
  }

  return {
    buildAuth0Client,
    login,
    logout,
  }
}

export default useAuth
