import createAuth0Client from '@auth0/auth0-spa-js'
import config from '../../config'
import { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  const client = createAuth0Client({
    domain: config.auth0Endpoint,
    audience: config.auth0Audience,
    client_id: config.auth0ClientId,
  })

  app.config.globalProperties.$auth0 = client
}
