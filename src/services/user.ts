import config from '../../config.js'

const fetch = (axios, token: string) => {
  const url = `${config.identityURL}/users/me`
  return axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

export default {
  fetch,
}
