import { createStore } from 'vuex'

import { authModule } from './auth'
import { userModule } from './user'
import { organizationModule } from './organization'
import { projectsModule } from './projects'
import { termsModule } from './acceptTerms'
import { snackbarModule } from './snackbar'
import { casesModule } from './cases'

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
    projects: projectsModule,
    snackbar: snackbarModule,
    acceptTerms: termsModule,
    cases: casesModule,
  },
})

export default store
