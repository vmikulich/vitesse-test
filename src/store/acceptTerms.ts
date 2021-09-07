import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import { RootState } from './index'
import axios from 'axios'
import termsService from '../services/terms'
import config from '../../config'

export interface TermsState {
  termsLink: string
  licenseLink: string
}

export const state: TermsState = {
  termsLink: config.termsLink,
  licenseLink: config.licenseLink,
}

const getters: GetterTree<TermsState, RootState> = {
  termsLink(state): string {
    return state.termsLink
  },

  licenseLink(state): string {
    return state.licenseLink
  },
}

const mutations: MutationTree<TermsState> = {}

const actions: ActionTree<TermsState, RootState> = {
  async acceptUserTerms(context, payload): Promise<void> {
    await termsService.userTerms.accept(axios, payload)
  },

  async acceptLicenseTerms(context, payload): Promise<void> {
    await termsService.licenseTerms.accept(axios, payload)
  },
}

const namespaced = true

export const termsModule: Module<TermsState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
