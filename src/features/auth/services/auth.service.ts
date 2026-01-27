import api from '@/api/axios'

export interface User {
  id: number
  name: string
  lastname: string
  email: string
  role: string
  is_active: boolean
  phone_number: string
  is_phone_verified: boolean
  created_at: string
  updated_at: string
  profile_picture: string | null
  deleted_at: string | null
  username: string | null
  password?: string | null
  onboarding_status: string
}

export interface VerifyTokenResponse {
  id: number
  user_id: number
  token: string
  expires_at: string
  used_at: string | null
  created_at: string
  user: User
}

export interface CompleteRegistrationDto {
  token: string
  password?: string
  username?: string
  first_name?: string
  lastname?: string
}

export interface LoginDto {
  identifier: string
  password?: string
  app_type?: string
}

export const authService = {
  login: async (data: LoginDto) => {
    const { data: responseData } = await api.post('/v1/auth/login', data)
    return responseData
  },
  verifyToken: async (token: string): Promise<VerifyTokenResponse> => {
    const { data } = await api.get<VerifyTokenResponse>(`/v1/user-activation-tokens/${token}`)
    return data
  },

  completeRegistration: async (data: CompleteRegistrationDto, token: string) => {
    const { data: responseData } = await api.post(`/v1/user-activation-tokens/${token}/activate`, data)
    return responseData
  },

  checkUsernameAvailability: async (username: string): Promise<{ available: boolean }> => {
    const { data } = await api.post<{ available: boolean }>('/v1/users/check-username', { username })
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/v1/auth/me')
    return data
  }
}
