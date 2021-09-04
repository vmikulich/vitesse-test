
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import { RootState } from './index'
import axios from 'axios'

export interface UserState {
  user: object|null
}

export const state: UserState = {
  user: null,
}

const mutations: MutationTree<UserState> = {
  setUser(state, payload: object) {
    state.user = payload
  },
}

const actions: ActionTree<UserState, RootState> = {
  async fetchUser({ commit }) {
    const user = await axios.get('https://identity.helios-dev-31eb55898dce18f48a3d0ededaf43128-0000.eu-de.containers.appdomain.cloud/users/me')
    console.log(user)
    commit('setUser', user.data)
  },
}

const getters: GetterTree<UserState, RootState> = {}

const namespaced = true

export const userModule: Module<UserState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
