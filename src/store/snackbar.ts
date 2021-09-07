import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import { RootState } from './index'
import { ISnackbar } from '~/interfaces/snackbar'

export interface SnackbarState {
  data: ISnackbar
}

export const state: SnackbarState = {
  data: {
    color: '',
    message: '',
  },
}

const getters: GetterTree<SnackbarState, RootState> = {
  snackbarData(state): ISnackbar {
    return state.data
  },
}

const mutations: MutationTree<SnackbarState> = {
  success(state, payload) {
    state.data = {
      color: 'success',
      message: payload?.message || 'Successfully done.',
    }
  },
  error(state, payload) {
    state.data = {
      color: 'error',
      message:
        payload?.message || 'Oops, something went wrong, please try again later.',
    }
  },
  reset() {
    state.data = {
      color: '',
      message: '',
    }
  },
}

const actions: ActionTree<SnackbarState, RootState> = {}

const namespaced = true

export const snackbarModule: Module<SnackbarState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
}
