
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import { RootState } from './index'
import axios from 'axios'
import userService from './../services/user'
import { IUser } from '~/interfaces/user'

export interface UserState {
  user: IUser|null
}

export const state: UserState = {
  user: null,
}

const mutations: MutationTree<UserState> = {
  setUser(state, payload: IUser) {
    state.user = payload
  },
}

const actions: ActionTree<UserState, RootState> = {
  async fetchUser({ commit }, token) {
    const user = await userService.fetch(axios, token)
    localStorage.setItem('auth._token.auth0', token)
    axios.defaults.headers.common.Authorization = token
    commit('setUser', user)
  },
}

const getters: GetterTree<UserState, RootState> = {
  getUser(state) {
    return state.user
  },
}

const namespaced = true

export const userModule: Module<UserState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
