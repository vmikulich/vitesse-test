import config from '../../config.js'

const fetch = (axios) => {
  const url = `${config.identityURL}/users/me`
  return axios
    .get(url)
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

export default {
  fetch,
}
