import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import axios from 'axios'
import { RootState } from './index'
import organizationService from '~/services/organization'
export interface OrganizationState {
  organizationId: number|''|null
  profile: object|null
}

const getDefaultState = (): OrganizationState => {
  const organizationId = localStorage.getItem('organizationId')

  return {
    organizationId: organizationId && Number(organizationId),
    profile: null,
  }
}

export const state = (): OrganizationState => getDefaultState()

const mutations: MutationTree<OrganizationState> = {
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

const actions: ActionTree<OrganizationState, RootState> = {
  async setOrganization({ commit }, payload) {
    commit('setOrganization', payload)
    if (!payload.skipUpdate) {
      await commit('getOrganizationProfile')
    }
  },
  async fetchOrganizationProfile({ commit }, payload: number) {
    const response = await organizationService.fetch(axios, payload)

    commit('setProfile', response.data)
  },
}

const getters: GetterTree<OrganizationState, RootState> = {
  organizationId(state) {
    return state.organizationId
  },

  organization(state) {
    return state.profile
  },
}

const namespaced = true

export const organizationModule: Module<OrganizationState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
