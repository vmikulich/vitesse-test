import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import axios from 'axios'
import projectsService from './../services/projects'
import { RootState } from './index'
import { IProject } from '~/interfaces/projects'

export interface ProjectState {
  projects: Array<IProject>
  project: IProject|null
}

export const state: ProjectState = {
  projects: [],
  project: null,
}

const getters: GetterTree<ProjectState, RootState> = {
  projects(state) {
    return state.projects
  },
}

const mutations: MutationTree<ProjectState> = {
  setProjects(state, payload: Array<IProject>) {
    state.projects = payload
  },

  setProject(state, payload: IProject) {
    state.project = payload
  },
}

const actions: ActionTree<ProjectState, RootState> = {
  async fetchAllProjects({ commit }, payload) {
    const projects = await projectsService.fetchAll(axios, payload)
    commit('setProjects', projects)
  },

  async fetchProject({ commit }, payload) {
    const projects = await projectsService.fetchById(axios, payload)
    commit('setProject', projects)
  },

  async changeStatus(context, payload) {
    await projectsService.changeProjectStatus(axios, payload)
  },

  async createProject(context, payload) {
    return await projectsService.create(axios, payload)
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
