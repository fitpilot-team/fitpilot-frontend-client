type AccessTokenListener = (token: string | null) => void

let accessToken: string | null = null
const listeners = new Set<AccessTokenListener>()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
  listeners.forEach((listener) => listener(token))
}

export function clearAccessToken() {
  setAccessToken(null)
}

export function subscribeAccessToken(listener: AccessTokenListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
