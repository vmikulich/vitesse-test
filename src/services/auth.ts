import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js'
import useAxios from '~/services/axios'
import config from '../../config'

const { setDefaultAuthToken, deleteDefaultAuthToken } = useAxios()

let authClient: Auth0Client|null = null

export default async() => {
  if (authClient) {
    return {
      authClient,
    }
  }

  authClient = await createAuth0Client({
    domain: config.auth0Endpoint,
    audience: config.auth0Audience,
    client_id: config.auth0ClientId,
    responce_type: 'code',
    redirect_uri: 'http://localhost:3000/auth',
    useRefreshTokens: true,
  })

  const login = (): void => {
    authClient && authClient.loginWithRedirect()
  }

  const logout = (): void => {
    if (authClient) {
      authClient.logout()
      deleteDefaultAuthToken()
    }
  }

  const handleRedirect = async(): Promise<void> => {
    if (authClient) {
      await authClient.handleRedirectCallback()
      const token = await authClient.getTokenSilently()
      localStorage.setItem('auth._token.auth0', `Bearer ${token}`)
      setDefaultAuthToken(`Bearer ${token}`)
    }
  }

  const isAuthenticated = async(token: string) => {
    if (authClient) {
      const isAuth: boolean = await authClient.isAuthenticated()
      if (isAuth) {
        setDefaultAuthToken(token)
      } else {
        authClient.loginWithRedirect()
      }
      return isAuth
    }
  }

  return {
    authClient,
    login,
    logout,
    handleRedirect,
    isAuthenticated,
  }
}
