import { useMutation } from '@tanstack/react-query'
import { onboardingService } from '../services/onboarding.service'
import type { OnboardingPayload } from '../types/onboarding.types'

export const useSubmitOnboarding = () => {
  return useMutation({
    mutationFn: (data: OnboardingPayload) => onboardingService.submitOnboarding(data),
  })
}
