import api from '@/api/axios'
import type { ClientHistoryResponse, Goal, Allergen } from './types'

export const usersService = {
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
  }
}
