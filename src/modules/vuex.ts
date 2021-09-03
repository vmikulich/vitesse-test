import store from '~/store/index'
import { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(store)
}
