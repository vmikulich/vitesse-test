import config from '../../config.js'
import { IProject, ICreateProject, IChangeStatus } from '~/interfaces/projects'

const fetchAll = (axios, payload: { id: number; params: URLSearchParams }) => {
  const url = `${config.projectURL}/organizations/${payload.id}/projects/all`
  return axios
    .get(url, { params: payload.params })
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

const fetchById = (axios, id: number) => {
  const url = `${config.projectURL}/projects/${id}`
  return axios
    .get(url)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

const create = (axios, payload: ICreateProject) => {
  const url = `${config.projectURL}/projects`
  return axios
    .post(url, payload)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

const changeProjectStatus = (axios, payload: IChangeStatus) => {
  const url = `${config.projectURL}/projects/${payload.id}/status`
  return axios
    .patch(url, null, { params: { ...payload.params } })
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

export default {
  fetchAll,
  changeProjectStatus,
  create,
  fetchById,
}
