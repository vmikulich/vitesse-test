import { useStore } from 'vuex'
import { IProject, ICreateProject, IChangeStatus } from '~/interfaces/projects'

export default () => {
  const store = useStore()

  const projects = computed<IProject[]>(() => store.getters['projects/projects'])

  const fetchAllProjects = async(data: { id: number; params: URLSearchParams }) => {
    await store.dispatch('projects/fetchAllProjects', data)
  }

  const fetchById = async(id: number) => {
    await store.dispatch('projects/fetchById', id)
  }

  const changeProjectStatus = async(data: IChangeStatus) => {
    await store.dispatch('changeStatus', data)
  }

  const createProject = async(data: ICreateProject) => {
    await store.dispatch('projects/createProject', data)
  }

  return {
    projects,
    fetchAllProjects,
    createProject,
    changeProjectStatus,
    fetchById,
  }
}
