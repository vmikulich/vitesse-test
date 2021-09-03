import createAuth0Client from '@auth0/auth0-spa-js'
import { UserModule } from '~/types'
import config from '../../config'

export const install: any = ({ app }) => {
  const client = createAuth0Client({
    domain: config.auth0Endpoint,
    audience: config.auth0Audience,
    client_id: config.auth0ClientId,
  })

  app.use(client)
}
