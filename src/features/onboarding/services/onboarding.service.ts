import axios from '@/api/axios'
import type { OnboardingPayload } from '../types/onboarding.types'

export const onboardingService = {
  submitOnboarding: async (data: OnboardingPayload) => {
    const response = await axios.post('/v1/professional-clients/onboarding', data)
    return response.data
  }
}
