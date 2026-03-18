import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from './auth.service'
import type { CompleteRegistrationDto, LoginDto } from './auth.service'

export const authKeys = {
  all: ['auth'] as const,
  verifyToken: (token: string) => [...authKeys.all, 'verify-token', token] as const,
  me: () => [...authKeys.all, 'me'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
}

export const useVerifyTokenQuery = (token: string | undefined) => {
  return useQuery({
    queryKey: authKeys.verifyToken(token || ''),
    queryFn: () => authService.verifyToken(token!),
    enabled: !!token,
    retry: false,
    staleTime: 0, // Always verify on mount
  })
}

export const useCompleteRegistrationMutation = (token: string) => {
  return useMutation({
    mutationFn: (data: CompleteRegistrationDto) => authService.completeRegistration(data, token),
  })
}

export const useCheckUsernameAvailabilityMutation = () => {
  return useMutation({
    mutationFn: (username: string) => authService.checkUsernameAvailability(username),
  })
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
  })
}

export const useMeQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.getMe,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useSessionsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: authService.getSessions,
    enabled,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: number | string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() })
    },
  })
}

export const useLogoutAllSessionsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.logoutAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() })
    },
  })
}
