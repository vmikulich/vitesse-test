import { useStore } from 'vuex'
import { IProject, ICreateProject, IChangeStatus } from '~/interfaces/projects'

export default () => {
  const store = useStore()

  const projects = computed<IProject[]>(() => store.getters['projects/projects'])
  const project = computed<IProject>(() => store.getters['projects/project'])

  const fetchAllProjects = async(data: { id: number; params: URLSearchParams }) => {
    await store.dispatch('projects/fetchAllProjects', data)
  }

  const fetchProject = async(id: string|undefined) => {
    await store.dispatch('projects/fetchProject', id)
  }

  const changeProjectStatus = async(data: IChangeStatus) => {
    await store.dispatch('changeStatus', data)
  }

  const createProject = async(data: ICreateProject) => {
    await store.dispatch('projects/createProject', data)
  }

  return {
    projects,
    project,
    fetchAllProjects,
    createProject,
    changeProjectStatus,
    fetchProject,
  }
}
