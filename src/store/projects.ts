
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import projectsService from './../services/projects'
import { RootState } from './index'
import axios from 'axios'
import { IProjects } from '~/interfaces/projects'

export interface ProjectState {
  projects: Array<IProjects>
}

export const state: ProjectState = {
  projects: [],
}

const mutations: MutationTree<ProjectState> = {
  setProjects(state, payload: Array<IProjects>) {
    state.projects = payload
  },
}

const actions: ActionTree<ProjectState, RootState> = {
  async fetchAllProjects({ commit }, payload) {
    const projects = await projectsService.fetchAll(axios, payload)
    commit('setProjects', projects)
  },
  async changeStatus(context, payload) {
    await projectsService.changeProjectStatus(axios, payload)
  },
}

const getters: GetterTree<ProjectState, RootState> = {
  projects(state) {
    return state.projects
  },
}

const namespaced = true

export const projectsModule: Module<ProjectState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
