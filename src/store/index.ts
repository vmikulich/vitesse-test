import { createStore } from 'vuex'

import { authModule } from './auth'
import { userModule } from './user'
import { organizationModule } from './organization'

export type RootState = {
  version: string
}

const store = createStore({
  state() {
    return {
      version: '0.0.1',
    }
  },

  getters: {},

  mutations: {},

  actions: {},

  modules: {
    auth: authModule,
    user: userModule,
    organization: organizationModule,
  },
})

export default store
