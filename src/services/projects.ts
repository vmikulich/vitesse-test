import config from '../../config.js'

const fetchAll = (axios, payload) => {
  const url = `${config.projectURL}/organizations/${payload.id}/projects/all`
  return axios
    .get(url, { params: payload.params })
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

const changeProjectStatus = (axios, payload) => {
  const url = `${config.projectURL}/projects/${payload.id}/status`
  return axios
    .patch(url, null, { params: { ...payload.params } })
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e))
}

export default {
  fetchAll,
  changeProjectStatus,
}
