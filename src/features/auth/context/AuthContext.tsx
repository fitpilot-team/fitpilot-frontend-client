import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { clearAccessToken, getAccessToken, setAccessToken, subscribeAccessToken } from '@/api/accessTokenStore'
import { authService, type User } from '../services/auth.service'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    // Optional optimistic user hydration (token remains memory-only)
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user from local storage:', e)
        localStorage.removeItem('user')
      }
    } else if (storedUser === 'undefined') {
      localStorage.removeItem('user')
    }

    const unsubscribe = subscribeAccessToken((nextToken) => {
      setToken(nextToken)
      if (!nextToken) {
        setUser(null)
        localStorage.removeItem('user')
      }
    })

    setToken(getAccessToken())

    const bootstrapSession = async () => {
      try {
        // If a valid refresh cookie exists, axios will refresh and retry /me automatically.
        const freshUser = await authService.getMe()
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
        setToken(getAccessToken())
      } catch {
        clearAccessToken()
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrapSession()

    return unsubscribe
  }, [])

  const login = (newToken: string, newUser: User) => {
    if (!newToken || !newUser) {
        console.error('Login attempted with missing token or user')
        return
    }
    setAccessToken(newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const logout = () => {
    clearAccessToken()
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated: !!token, 
        login, 
        logout,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
