import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import useAuthService from './../services/auth'
import { RootState } from './index'
import axios from 'axios'

const { authClient } = await useAuthService()

const getDefaultState = (): AuthState => {
  const organizationId = localStorage.getItem('organizationId')

  return {
    organizationId: organizationId && Number(organizationId),
    profile: null,
  }
}

export interface AuthState {
  organizationId: number|''|null
  profile: object|null
}

export const state: AuthState = () => getDefaultState()

const mutations: MutationTree<AuthState> = {
  setOrganization(state, payload) {
    if (payload.organizationId) {
      localStorage.setItem('organizationId', payload.organizationId)
      state.organizationId = payload.organizationId
    } else {
      localStorage.removeItem('organizationId')
      state.organizationId = null
    }
  },

  setProfile(state, payload) {
    state.profile = payload
  },
}

const actions: ActionTree<AuthState, RootState> = {
  async setOrganization({ commit }, payload) {
    await commit('setOrganization', payload)
    if (!payload.skipUpdate) {
      await commit('getOrganizationProfile')
    }
  },
  async getOrganizationProfile({ getters, commit }) {
    const response = await axios.get(
      `https://organization.helios-dev-31eb55898dce18f48a3d0ededaf43128-0000.eu-de.containers.appdomain.cloud/organizations/${getters.organizationId}`,
    )

    return commit('setProfile', response.data)
  },
}

const getters: GetterTree<AuthState, RootState> = {
  organizationId(state, _getters, rootState) {
    return state.organizationId || rootState.auth.user.organizationId
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
