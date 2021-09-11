
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import axios from 'axios'
import casesService from './../services/cases'
import { RootState } from './index'
import { ICase, ICaseSetup, ICaseFile } from '~/interfaces/cases'

export interface CasetState {
  case: ICase|null
  caseSetup: ICaseSetup|null
  caseFiles: ICaseFile[]|null
}

export const state: CasetState = {
  case: null,
  caseSetup: null,
  caseFiles: null,
}

const getters: GetterTree<CasetState, RootState> = {
  case(state) {
    return state.case
  },

  caseSetup(state) {
    return state.caseSetup
  },

  caseFiles(state) {
    return state.caseFiles
  },
}

const mutations: MutationTree<CasetState> = {
  setCase(state, payload: ICase) {
    state.case = payload
  },

  setCaseSetup(state, payload: ICaseSetup) {
    state.caseSetup = payload
  },

  setCaseFiles(state, payload: ICaseFile[]) {
    state.caseFiles = payload
  },
}

const actions: ActionTree<CasetState, RootState> = {
  async fetchCase({ commit }, payload: string|undefined): Promise<void> {
    const res = await casesService.fetchCase(axios, payload)
    commit('setCase', res)
  },

  async fetchCaseSetup({ commit }, payload: string|undefined): Promise<void> {
    const res = await casesService.fetchCaseSetup(axios, payload)
    commit('setCaseSetup', res)
  },

  async fetchCaseFiles({ commit }, payload: string|undefined): Promise<void> {
    const res = await casesService.fetchCaseFiles(axios, payload)
    commit('setCaseFiles', res)
  },
}

const namespaced = true

export const casesModule: Module<CasetState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
