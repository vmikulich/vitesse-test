import axios from 'axios'

export default () => {
  const instance = axios.create()

  const setDefaultAuthToken = (token: string) => {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  const deleteDefaultAuthToken = () => {
    delete instance.defaults.headers.common.Authorization
  }

  return {
    setDefaultAuthToken,
    deleteDefaultAuthToken,
  }
}
