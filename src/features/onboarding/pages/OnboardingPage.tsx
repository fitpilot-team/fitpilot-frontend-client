import { useRef, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { GoalSelection, AllergenSelection, MetricInput, PreferenceInput, MedicalDetailsInput } from '../components/OnboardingSteps'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '@/components/common/LanguageToggle'
import { useSubmitOnboarding } from '../hooks/useSubmitOnboarding'
import type { OnboardingPayload } from '../types/onboarding.types'
import { useMeQuery } from '@/features/auth/services/auth.queries'
import { useQueryClient } from '@tanstack/react-query'

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  // Fetch fresh user data to check status
  const { data: freshUser } = useMeQuery()
  
  // Sync AuthContext with fresh data if it changes (optional but recommended)
  useEffect(() => {
    if (freshUser && user && JSON.stringify(freshUser) !== JSON.stringify(user)) {
         // We might want to update the context here, but AuthContext.login takes a token. 
         // For now, we rely on 'freshUser' for the redirection logic locally or assume AuthContext updates elsewhere.
         // Actually, let's just use freshUser for the status check.
    }
  }, [freshUser, user])

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    goals: [],
    allergens: [],
    weight_kg: '',
    height_cm: '',
    dislikes: [],
    likes: [],
    medical_conditions: '',
    surgeries: [],
    notes: ''
  })
  // Removed local isSubmitting state in favor of mutation status
  const submitOnboarding = useSubmitOnboarding()

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  // Scroll refs
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)
  const step4Ref = useRef<HTMLDivElement>(null)
  const step5Ref = useRef<HTMLDivElement>(null)

  const steps = [
    { id: 1, ref: step1Ref, Component: GoalSelection },
    { id: 2, ref: step2Ref, Component: AllergenSelection },
    { id: 3, ref: step3Ref, Component: MetricInput },
    { id: 4, ref: step4Ref, Component: PreferenceInput },
    { id: 5, ref: step5Ref, Component: MedicalDetailsInput },
  ]

  // Track active step for styling
  const [activeVisibleStep, setActiveVisibleStep] = useState(1)

  useEffect(() => {
    // ... (observer logic remains same)
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', 
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepId = Number(entry.target.getAttribute('data-step-id'))
          setActiveVisibleStep(stepId)
          setStep(stepId)
        }
      })
    }, observerOptions)

    steps.forEach(s => {
      if (s.ref.current) observer.observe(s.ref.current)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToStep = (stepId: number) => {
    const target = steps.find(s => s.id === stepId)?.ref.current
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleNext = (stepData: any) => {
    updateFormData(stepData)
    const nextStep = step + 1
    if (nextStep <= 5) {
      setStep(nextStep)
      scrollToStep(nextStep)
    }
  }

  const handleBack = () => {
    const prevStep = step - 1
    if (prevStep >= 1) {
       setStep(prevStep)
       scrollToStep(prevStep)
    }
  }

  const handleComplete = async (finalData: any) => {
    try {
      const allData = { ...formData, ...finalData }
      
      const payload: OnboardingPayload = {
        user_id: Number(user?.id),
        form_version: 'v1',
        goals: allData.goals,
        allergens: allData.allergens,
        metrics: {
            weight_kg: Number(allData.weight_kg),
            height_cm: Number(allData.height_cm)
        },
        preferences: {
            likes: allData.likes || [],
            dislikes: allData.dislikes || []
        },
        injuries: allData.surgeries.map((s: any) => ({
            name: s.name,
            body_part: s.body_part,
            severity: Number(s.severity),
            status: s.status,
            limitations: s.limitations,
            diagnosis_date: s.diagnostic_date || null,
            recovery_date: s.recovery_date || null
        })),
        medical_conditions: allData.medical_conditions,
        notes: allData.notes
      }

      console.log('Submitting Onboarding Payload:', payload)
      
      await submitOnboarding.mutateAsync(payload)
      
      
      // Invalidate the 'me' query to fetch the updated status
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      
      // alert(t('onboarding.complete')) 
      navigate({ to: '/dashboard' })
      // Navigation will be handled by the useEffect observing the user status
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error saving data.') 
    }
  }

  // Effect to handle redirection when onboarding is completed
  useEffect(() => {
    // Check either context user or fresh query user
    const currentUser = freshUser || user
    
    if (currentUser?.onboarding_status === 'completed') {
       // Check for stored redirect path
       const redirectPath = localStorage.getItem('redirectAfterLogin')
       if (redirectPath) {
         localStorage.removeItem('redirectAfterLogin')
         navigate({ to: redirectPath })
       } else {
         navigate({ to: '/dashboard' })
       }
    }
  }, [freshUser, user, navigate])
  
  if (submitOnboarding.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">{t('onboarding.settingUp')}</h2>
          <p className="text-gray-500">{t('onboarding.settingUpDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header / Progress */}
          <div className="flex-none bg-white z-10 p-4 shadow-sm relative">
           <div className="max-w-md mx-auto relative">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-gray-500">{t('onboarding.step', { current: activeVisibleStep, total: 5 })}</span>
                 
                 <div className="flex items-center gap-3">
                    <button 
                       onClick={() => {
                          logout()
                          navigate({ to: '/auth/sign-in' })
                       }}
                       className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
                     >
                         <LogOut size={16} />
                         <span>{t('onboarding.exit')}</span>
                     </button>
                 </div>
              </div>
              
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(activeVisibleStep / 5) * 100}%` }}
                />
              </div>
           </div>
           
           {/* Language Toggle - Absolute Top Right of Screen */}
           <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <LanguageToggle />
           </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth p-4">
           <div className="max-w-xl mx-auto pb-[50vh]"> {/* Padding bottom to allow last step to scroll up */}
              {steps.map(({ id, ref, Component }) => (
                <div 
                  key={id} 
                  ref={ref}
                  data-step-id={id}
                  className={`
                    min-h-[80vh] flex flex-col justify-center snap-center transition-all duration-700 ease-in-out
                    ${activeVisibleStep === id ? 'opacity-100 scale-100 blur-none' : 'opacity-30 scale-95 blur-[1px]'}
                  `}
                >
                   <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                      <Component
                         onNext={handleNext}
                         onBack={handleBack}
                         onComplete={handleComplete}
                         initialData={formData}
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>
    </div>
  )
}
