import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearAccessToken, getAccessToken, setAccessToken } from './accessTokenStore'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

let refreshTokenPromise: Promise<string> | null = null

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://nutrition-api.fitpilot.fit',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const requestTokenRefresh = async (): Promise<string> => {
  const { data } = await api.post(
    '/v1/auth/refresh',
    undefined,
    { skipAuthRefresh: true } as RetryableRequestConfig,
  )

  const nextAccessToken = data?.access_token || data?.token

  if (!nextAccessToken) {
    throw new Error('Refresh response did not include an access token')
  }

  setAccessToken(nextAccessToken)
  return nextAccessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const statusCode = error.response?.status
    const requestUrl = originalRequest.url || ''
    const isRefreshRequest = originalRequest.skipAuthRefresh || requestUrl.includes('/v1/auth/refresh')

    if (statusCode !== 401 || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshTokenPromise) {
        refreshTokenPromise = requestTokenRefresh().finally(() => {
          refreshTokenPromise = null
        })
      }

      const nextAccessToken = await refreshTokenPromise

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
      }

      return api(originalRequest)
    } catch (refreshError) {
      clearAccessToken()
      localStorage.removeItem('user')
      return Promise.reject(refreshError)
    }
  },
)

export default api
