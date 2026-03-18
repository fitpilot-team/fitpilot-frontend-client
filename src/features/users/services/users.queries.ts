import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService, type UpdateUserByIdPayload } from './users.service'

export const USERS_KEYS = {
  all: ['users'] as const,
  me: () => [...USERS_KEYS.all, 'me'] as const,
  detail: (id: number | string) => [...USERS_KEYS.all, 'detail', id] as const,
  history: (id: number | string) => [...USERS_KEYS.all, 'history', id] as const,
  goals: () => [...USERS_KEYS.all, 'goals'] as const,
  allergens: () => [...USERS_KEYS.all, 'allergens'] as const
}

export const useUserByIdQuery = (id: number | string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: USERS_KEYS.detail(id!),
    queryFn: () => usersService.getUserById(id!),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number | string; data: UpdateUserByIdPayload }) =>
      usersService.updateProfile(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.me() })
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.userId) })
    }
  })
}

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file }: { file: File; userId?: number | string }) => usersService.updateProfilePicture(file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.me() })
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.userId) })
      }
    },
  })
}
