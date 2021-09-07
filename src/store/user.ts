
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import { RootState } from './index'
import axios from 'axios'
import userService from './../services/user'
import { USER_ROLES } from '~/constants'
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

  // isSuperAdmin(state, getters, rootState, rootGetters) {
  //   return state.user
  //     ? (state.user.role === USER_ROLES.superAdmin && !rootGetters['organization/organizationId'])
  //     : false
  // },

  // isSuperUser(state, getters, rootState, rootGetters) {
  //   return state.user
  //     ? (state.user.role === USER_ROLES.superUser && !rootGetters['organization/organizationId'])
  //     : false
  // },

  // isAdmin(state, getters, rootState, rootGetters) {
  //   return state.user
  //     ? state.user.role === USER_ROLES.admin
  //       || (state.user.role === USER_ROLES.superUser && rootGetters['organization/organizationId'])
  //     : false
  // },
}

const namespaced = true

export const userModule: Module<UserState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
