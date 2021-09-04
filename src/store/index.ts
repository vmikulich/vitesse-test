import { createStore } from 'vuex'

import { authModule } from './auth'
import { userModule } from './user'

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
  },
})

export default store
