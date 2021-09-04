
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import useAuthService from './../services/auth'
import { RootState } from './index'
import axios from 'axios'

const { authClient, isAuthenticated } = await useAuthService()

export interface AuthState {
  isGranted: boolean
  user: object|null
}

export const state: AuthState = {
  isGranted: false,
  user: null,
}

const mutations: MutationTree<AuthState> = {
  setCharList(state, status: boolean) {
    state.isGranted = status
  },
}

const actions: ActionTree<AuthState, RootState> = {
  login(): void {
    authClient.loginWithRedirect()
  },

  logout(): void {
    authClient.logout()
    delete axios.defaults.headers.common.Authorization
    localStorage.removeItem('auth0_token')
  },

  async isAuthenticated({ commit }, token) {
    const isAuth: boolean = await authClient.isAuthenticated()
    console.log(isAuth)
    if (isAuth) {
      commit('setCharList', isAuth)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      localStorage.setItem('auth0_token', token)
    } else {
      localStorage.removeItem('auth0_token')
    }
    console.log('sdfasdf')
  },

  async handleRedirect({ dispatch }): Promise<void> {
    await authClient.handleRedirectCallback()
    const token = await authClient.getTokenSilently()
    console.log('dsfas')
    dispatch('isAuthenticated', token)
    localStorage.setItem('auth0_token', token)
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
  },
}

const getters: GetterTree<AuthState, RootState> = {
  isGranted(state) {
    return state.isGranted
  },
}

const namespaced = true

export const authModule: Module<AuthState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
