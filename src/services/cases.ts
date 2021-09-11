import config from '../../config.js'

const fetchCase = (axios, id: number) => {
  const url = `${config.caseURL}/cases/${id}`
  return axios
    .get(url)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

const fetchCaseSetup = (axios, id: number) => {
  const url = `${config.caseURL}/cases/setup/${id}`
  return axios
    .get(url)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

const fetchCaseFiles = (axios, id: number) => {
  const url = `${config.fileserverURL}/cases/${id}/files`
  return axios
    .get(url)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

export default {
  fetchCase,
  fetchCaseSetup,
  fetchCaseFiles,
}
