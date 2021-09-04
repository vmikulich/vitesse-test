
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import useAuthService from './../services/auth'
import { RootState } from './index'

const { authClient } = await useAuthService()

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
}

const getters: GetterTree<AuthState, RootState> = {}

const namespaced = true

export const authModule: Module<AuthState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
