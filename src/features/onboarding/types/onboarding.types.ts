export interface Goal {
  id: number
  name: string
}

export interface Allergen {
  id: number
  name: string
  type: string
}

export interface Metrics {
  weight_kg: number
  height_cm: number
}

export interface Preferences {
  likes: string[]
  dislikes: string[]
}

export interface Injury {
  name: string
  body_part: string
  severity: number
  status: 'active' | 'recovering' | 'resolved' | 'chronic'
  limitations: string
  diagnosis_date?: string
  recovery_date?: string
}

export interface OnboardingPayload {
  user_id: number
  form_version: string
  date_of_birth: string
  goals: Goal[]
  allergens: Allergen[]
  metrics: Metrics
  preferences: Preferences
  injuries: Injury[]
  medical_conditions: string
  notes: string
}
