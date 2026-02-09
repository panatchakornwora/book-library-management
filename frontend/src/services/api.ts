import axios from "axios"
import { refresh } from "./auth"
import { clearSession, getToken, setToken } from "./session"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config
    if (!original || original._retry) {
      return Promise.reject(error)
    }

    if (error?.response?.status === 401) {
      try {
        original._retry = true
        const res = await refresh()
        setToken(res.accessToken)
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${res.accessToken}`
        return api(original)
      } catch (refreshErr) {
        clearSession()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default api
