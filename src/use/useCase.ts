import { useStore } from 'vuex'
import { ICase, ICaseSetup, ICaseFile } from '~/interfaces/cases'

export default () => {
  const store = useStore()

  const currentCase = computed<ICase>(() => store.getters['cases/case'])
  const currentCaseSetup = computed<ICaseSetup>(() => store.getters['cases/caseSetup'])
  const currentCaseFiles = computed<ICaseFile[]>(() => store.getters['cases/caseFiles'])

  const fetchCase = async(id: string|undefined): Promise<void> => {
    await store.dispatch('cases/fetchCase', id)
  }

  const fetchCaseSetup = async(id: string|undefined): Promise<void> => {
    await store.dispatch('cases/fetchCaseSetup', id)
  }

  const fetchCaseFiles = async(id: string|undefined): Promise<void> => {
    await store.dispatch('cases/fetchCaseFiles', id)
  }

  return {
    currentCase,
    currentCaseSetup,
    currentCaseFiles,
    fetchCase,
    fetchCaseSetup,
    fetchCaseFiles,
  }
}
