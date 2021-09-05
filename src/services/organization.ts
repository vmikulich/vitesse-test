import config from '../../config.js'

const fetch = (axios, id: number) => {
  const url = `${config.organizationURL}/organizations/${id}`
  return axios
    .get(url)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

export default {
  fetch,
}
