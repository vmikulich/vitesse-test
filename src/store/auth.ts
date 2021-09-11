
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import useAuthService from './../services/auth'
import { RootState } from './index'
import axios from 'axios'

const authClient = await useAuthService()

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
    authClient.login()
  },

  logout(): void {
    authClient.logout()
  },

  async checkAuthentication({ commit }, token: string): Promise<void> {
    const isAuth = await authClient.isAuthenticated(token)
    if (isAuth) {
      commit('setCharList', isAuth)
    }
  },

  async handleRedirect(): Promise<void> {
    await authClient.handleRedirect()
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
