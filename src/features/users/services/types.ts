export interface Allergen {
  id: number
  name: string
  type: string
  created_at: string
}

export interface ClientAllergen {
  client_id: number
  allergen_id: number
  allergens: Allergen
}

export interface Goal {
  id: number
  code: string
  name: string
  description: string | null
  created_at: string
}

export interface ClientGoal {
  id: number
  client_id: number
  goal_id: number
  is_primary: boolean
  created_at: string
  goals: Goal
}

export interface ClientPreferences {
  likes: string[]
  dislikes: string[]
}

export interface ClientRecord {
  id: number
  client_id: number
  medical_conditions: string
  notes: string
  preferences: ClientPreferences
  created_at: string
  updated_at: string
}

export interface ClientHealthMetric {
  id: number
  user_id: number
  recorded_at: string
  glucose_mg_dl: number | null
  glucose_context: string | null
  systolic_mmhg: number | null
  diastolic_mmhg: number | null
  heart_rate_bpm: number | null
  oxygen_saturation_pct: string | null
  notes: string | null
}

export interface ClientInjury {
  id: number
  user_id: number
  name: string
  body_part: string
  severity: number
  status: string
  limitations: string
  diagnosis_date: string
  recovery_date: string | null
  created_at: string
}

export interface DailyTarget {
  id: number
  user_id: number
  start_date: string
  end_date: string
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
  is_active: boolean
}

export interface ClientMetric {
  id: number
  user_id: number
  date: string
  logged_at: string
  weight_kg: string
  height_cm: string
  body_fat_pct: string
  muscle_mass_kg: string
  visceral_fat: string
  water_pct: string | null
  waist_cm: string
  hip_cm: string
  chest_cm: string
  arm_left_cm: string | null
  arm_right_cm: string | null
  thigh_left_cm: string
  thigh_right_cm: string
  calf_left_cm: string
  calf_right_cm: string
  notes: string | null
  recorded_by_user_id: number
}

export interface Appointment {
  id: number
  professional_id: number
  client_id: number
  scheduled_at: string
  duration_minutes: number
  status: string
  title: string | null
  meeting_link: string | null
  notes: string | null
  deleted_at: string | null
  start_date: string | null
  end_date: string | null
  effective_duration: number | null
  is_intake: boolean
}

export interface ClientHistoryResponse {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
  is_active: boolean
  role: string
  phone_number: string | null
  profile_picture: string | null
  deleted_at: string | null
  lastname: string
  username: string
  is_phone_verified: boolean
  onboarding_status: string
  onboarding_completed_at: string | null
  client_allergens: ClientAllergen[]
  client_goals: ClientGoal[]
  client_records: ClientRecord[]
  client_health_metrics: ClientHealthMetric[]
  client_injuries: ClientInjury[]
  daily_targets: DailyTarget[]
  client_metrics: ClientMetric[]
  appointments: Appointment[]
}
