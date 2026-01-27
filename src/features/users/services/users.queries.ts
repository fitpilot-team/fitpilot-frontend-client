import { useQuery } from '@tanstack/react-query'
import { usersService } from './users.service'

export const USERS_KEYS = {
  all: ['users'] as const,
  history: (id: number | string) => [...USERS_KEYS.all, 'history', id] as const,
  goals: () => [...USERS_KEYS.all, 'goals'] as const,
  allergens: () => [...USERS_KEYS.all, 'allergens'] as const
}

export const useGoals = (enabled: boolean = true) => {
  return useQuery({
    queryKey: USERS_KEYS.goals(),
    queryFn: usersService.getGoals,
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

export const useAllergens = (enabled: boolean = true) => {
  return useQuery({
    queryKey: USERS_KEYS.allergens(),
    queryFn: usersService.getAllergens,
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

export const useClientHistory = (id: number | string | undefined, enabled: boolean = true) => {
  console.log('id', id)
  return useQuery({
    queryKey: USERS_KEYS.history(id!),
    queryFn: () => usersService.getClientHistory(id!),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
