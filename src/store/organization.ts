import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import axios from 'axios'
import { RootState } from './index'
import organizationService from '~/services/organization'
import { IOrganization } from '~/interfaces/organizations'
export interface OrganizationState {
  switchedOrganizationId: number|''|null
  profile: IOrganization|null
}

const getDefaultState = (): OrganizationState => {
  const switchedOrganizationId = localStorage.getItem('switchedOrganizationId')

  return {
    switchedOrganizationId: switchedOrganizationId && Number(switchedOrganizationId),
    profile: null,
  }
}

export const state = (): OrganizationState => getDefaultState()

const mutations: MutationTree<OrganizationState> = {
  setOrganization(state, payload) {
    if (payload.organizationId) {
      localStorage.setItem('organizationId', payload.organizationId)
      state.switchedOrganizationId = payload.organizationId
    } else {
      localStorage.removeItem('organizationId')
      state.switchedOrganizationId = null
    }
  },

  setProfile(state, payload) {
    state.profile = payload
  },
}

const actions: ActionTree<OrganizationState, RootState> = {
  async switchOrganization({ commit }, payload) {
    commit('setOrganization', payload)
    if (!payload.skipUpdate) {
      await commit('getOrganizationProfile')
    }
  },
  async fetchOrganizationProfile({ commit }, payload: number) {
    const response = await organizationService.fetch(axios, payload)
    commit('setProfile', response)
  },
}

const getters: GetterTree<OrganizationState, RootState> = {
  switchedOrganizationId(state) {
    return state.switchedOrganizationId
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
