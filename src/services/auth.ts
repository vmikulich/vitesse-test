import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js'
import config from '../../config'

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
  })

  return {
    authClient,
  }
}
