import config from '../../../config.js'

const accept = (axios, payload: number|string) => {
  const url = `${config.organizationURL}/organizations/${payload}/terms`
  return axios
    .post(url, {
      termsAccepted: true,
    })
    .then((res) => Promise.resolve(res.data))
    .catch((e) => Promise.reject(e.response.data))
}

export default {
  accept,
}
