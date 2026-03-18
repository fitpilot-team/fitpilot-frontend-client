import api from '@/api/axios'
import type { ClientHistoryResponse, Goal, Allergen } from './types'
import type { User as AuthUser } from '@/features/auth/services/auth.service'

export type UpdateUserByIdPayload = {
  name?: string
  email?: string
  password?: string
  is_active?: boolean
  deleted_at?: string
  lastname?: string
  username?: string
  phone_number?: string
  profile_picture?: string
  professional_id?: number
  genre?: string
  date_of_birth?: string
}

export type UserByIdResponse = AuthUser & {
  genre?: string | null
  date_of_birth?: string | null
  professional_id?: number | null
  service_type?: string | null
}

export const usersService = {
  getUserById: async (id: number | string): Promise<UserByIdResponse> => {
    const { data } = await api.get<UserByIdResponse>(`/v1/users/${id}`)
    return data
  },

  getClientHistory: async (id: number | string): Promise<ClientHistoryResponse> => {
    console.log(id)
    const { data } = await api.get<ClientHistoryResponse>(`/v1/professional-clients/history-client/${id}`)
    return data
  },

  getGoals: async (): Promise<Goal[]> => {
    const { data } = await api.get<Goal[]>('/v1/goals')
    return data
  },

  getAllergens: async (): Promise<Allergen[]> => {
    try {
      const { data } = await api.get<Allergen[]>('/v1/allergens')
      console.log('Allergens fetched:', data)
      return data
    } catch (error) {
      console.error('Error fetching allergens API:', error)
      throw error
    }
  },

  saveClientGoals: async (goals: number[]) => {
    const { data } = await api.post('/v1/client-goals', { goals })
    return data
  },

  saveClientAllergens: async (allergens: number[]) => {
    const { data } = await api.post('/v1/client-allergens', { allergens })
    return data
  },

  saveClientMetrics: async (metrics: any) => {
    const { data } = await api.post('/v1/client-metrics', metrics)
    return data
  },

  saveClientRecords: async (records: any) => {
    const { data } = await api.post('/v1/client-records', records)
    return data
  },

  updateOnboardingStatus: async (status: string) => {
    const { data } = await api.patch('/v1/users/me', { onboarding_status: status })
    return data
  },

  updateProfile: async (userId: number | string, profileData: UpdateUserByIdPayload) => {
    const { data } = await api.patch(`/v1/users/${userId}`, profileData)
    return data
  },

  updateProfilePicture: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.patch('/v1/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  }
}
