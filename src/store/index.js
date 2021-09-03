import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
  state() {
    return {
      user: null,
    }
  },

  mutations: {
    setUser(state, userData) {
      state.user = userData
    },
  },

  getters: {
    authenticated(state) {
      return !!state.user
    },
  },

  actions: {
    login() {
      // TODO Vue.Auth0.loginWithRedirect()
    },

    handleLoginCallback() {
      // TODO Vue.Auth0.handleRedirectCallBack
    },
  },
})

export default store
