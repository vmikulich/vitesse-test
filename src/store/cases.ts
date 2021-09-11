
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import axios from 'axios'
import casesService from './../services/projects'
import { RootState } from './index'
import { ICase } from '~/interfaces/projects'

export interface ProjectState {
  case: {}|null
  caseSetup: {}|null
  caseFiles: []|null
}

export const state: ProjectState = {
  case: null,
  caseSetup: null,
  caseFiles: null,
}

const getters: GetterTree<ProjectState, RootState> = {
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

const mutations: MutationTree<ProjectState> = {
  setCase(state, payload) {
    state.case = payload
  },

  setCaseSetup(state, payload) {
    state.caseSetup = payload
  },

  setCaseFiles(state, payload) {
    state.caseFiles = payload
  },
}

const actions: ActionTree<ProjectState, RootState> = {

}

const namespaced = true

export const projectsModule: Module<ProjectState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
