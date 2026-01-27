import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from './auth.service'
import type { CompleteRegistrationDto, LoginDto } from './auth.service'

export const authKeys = {
  all: ['auth'] as const,
  verifyToken: (token: string) => [...authKeys.all, 'verify-token', token] as const,
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
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
