import React, { useState, useEffect } from 'react'
import { Check, X, Search, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usersService } from '@/features/users/services/users.service'
import type { Goal, Allergen } from '@/features/users/services/types'

// Reusable Chip Component
const Chip = ({ label, isSelected, onClick, onRemove }: { label: string, isSelected?: boolean, onClick?: () => void, onRemove?: () => void }) => (
  <div 
    onClick={onClick}
    className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer border
      ${isSelected 
        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }
    `}
  >
    {label}
    {onRemove && (
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="ml-2 hover:text-red-200 focus:outline-none"
      >
        <X size={14} />
      </button>
    )}
  </div>
)

// Step 1: Goal Selection
export const GoalSelection = ({ onNext, initialData }: { onNext: (data: any) => void, onBack?: () => void, onComplete?: (data: any) => void, initialData: any }) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoals, setSelectedGoals] = useState<number[]>(initialData?.goals || [])
  const [isLoading, setIsLoading] = useState(true)

  const { t } = useTranslation()

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await usersService.getGoals()
        // @ts-ignore
        setGoals(data)
      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGoals()
  }, [])

  const toggleGoal = (id: number) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.goals.title')}</h2>
        <p className="mt-2 text-gray-600">{t('onboarding.goals.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading goals...</div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {goals.map(goal => (
            <Chip 
              key={goal.id} 
              label={goal.name} 
              isSelected={selectedGoals.includes(goal.id)}
              onClick={() => toggleGoal(goal.id)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center pt-8">
        <button
          onClick={() => {
            const selectedGoalObjects = goals.filter(g => selectedGoals.includes(g.id));
            onNext({ goals: selectedGoalObjects })
          }}
          disabled={selectedGoals.length === 0}
          className="group relative flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
        >
          {t('onboarding.next')} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// Step 2: Allergen Selection
export const AllergenSelection = ({ onNext, onBack, initialData }: { onNext: (data: any) => void, onBack?: () => void, onComplete?: (data: any) => void, initialData: any }) => {
  const { t } = useTranslation()
  const [allergens, setAllergens] = useState<Allergen[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>(initialData?.allergens || [])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        const data = await usersService.getAllergens()
        console.log('Component received allergens:', data)
        // @ts-ignore
        setAllergens(data)
      } catch (error) {
        console.error('Error fetching allergens:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllergens()
  }, [])

  const toggleAllergen = (id: number) => {
    setSelectedAllergens(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const filteredAllergens = allergens.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.allergens.title')}</h2>
        <p className="mt-2 text-gray-600">{t('onboarding.allergens.subtitle')}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('onboarding.allergens.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl min-h-[200px] max-h-[300px] overflow-y-auto border border-gray-100">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Allergies Section */}
            {filteredAllergens.some(a => a.type === 'allergy') && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1 uppercase tracking-wider">{t('onboarding.allergens.allergiesSection')}</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredAllergens
                    .filter(a => a.type === 'allergy')
                    .map(allergen => (
                      <Chip
                        key={allergen.id}
                        label={allergen.name}
                        isSelected={selectedAllergens.includes(allergen.id)}
                        onClick={() => toggleAllergen(allergen.id)}
                      />
                  ))}
                </div>
              </div>
            )}

            {/* Intolerances Section */}
            {filteredAllergens.some(a => a.type === 'intolerance') && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1 uppercase tracking-wider">{t('onboarding.allergens.intolerancesSection')}</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredAllergens
                    .filter(a => a.type === 'intolerance')
                    .map(allergen => (
                      <Chip
                        key={allergen.id}
                        label={allergen.name}
                        isSelected={selectedAllergens.includes(allergen.id)}
                        onClick={() => toggleAllergen(allergen.id)}
                      />
                  ))}
                </div>
              </div>
            )}
            
            {filteredAllergens.length === 0 && (
              <p className="text-gray-500 w-full text-center py-4">{t('onboarding.allergens.noResults')} "{search}"</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8 gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {t('onboarding.back')}
          </button>
        )}
        <button
          onClick={() => {
            const selectedAllergenObjects = allergens.filter(a => selectedAllergens.includes(a.id));
            onNext({ allergens: selectedAllergenObjects })
          }}
          className="group relative flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
        >
          {t('onboarding.next')} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// Step 3: Personal Information
export const PersonalInfoInput = ({ onNext, onBack, initialData }: { onNext: (data: any) => void, onBack?: () => void, onComplete?: (data: any) => void, initialData: any }) => {
  const { t } = useTranslation()
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth || '')

  const validationError = (() => {
    if (!dateOfBirth) {
      return t('onboarding.personal.validationRequired')
    }

    const parsedDate = new Date(`${dateOfBirth}T00:00:00`)
    if (Number.isNaN(parsedDate.getTime())) {
      return t('onboarding.personal.validationInvalid')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (parsedDate > today) {
      return t('onboarding.personal.validationFuture')
    }

    return ''
  })()

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.personal.title')}</h2>
        <p className="mt-2 text-gray-600">{t('onboarding.personal.subtitle')}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t('onboarding.personal.dateOfBirth')}</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
        />
      </div>

      {validationError ? (
        <p className="text-sm text-red-600">{validationError}</p>
      ) : null}

      <div className="flex justify-center pt-8 gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {t('onboarding.back')}
          </button>
        )}
        <button
          onClick={() => onNext({ date_of_birth: dateOfBirth })}
          disabled={Boolean(validationError)}
          className="group relative flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
        >
          {t('onboarding.next')} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// Step 4: Metrics Input
export const MetricInput = ({ onNext, onBack, initialData }: { onNext: (data: any) => void, onBack?: () => void, onComplete?: (data: any) => void, initialData: any }) => {
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState({
    weight_kg: initialData?.weight_kg || '',
    height_cm: initialData?.height_cm || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMetrics(prev => ({ ...prev, [name]: value }))
  }

  const isValid = metrics.weight_kg && metrics.height_cm

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.metrics.title')}</h2>
        <p className="mt-2 text-gray-600">{t('onboarding.metrics.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('onboarding.metrics.weight')}</label>
          <input
            type="number"
            name="weight_kg"
            value={metrics.weight_kg}
            onChange={handleChange}
            placeholder="0.0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('onboarding.metrics.height')}</label>
          <input
            type="number"
            name="height_cm"
            value={metrics.height_cm}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="flex justify-center pt-8 gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {t('onboarding.back')}
          </button>
        )}
        <button
          onClick={() => onNext(metrics)}
          disabled={!isValid}
          className="group relative flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
        >
          {t('onboarding.next')} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// Step 4: Food Preferences (Likes and Dislikes)
export const PreferenceInput = ({ onNext, onBack, initialData }: { onNext: (data: any) => void, onBack?: () => void, onComplete?: (data: any) => void, initialData: any }) => {
  const { t } = useTranslation()
  const [preferences, setPreferences] = useState({
    likes: initialData?.likes || [],
    dislikes: initialData?.dislikes || [],
  })
  const [currentLike, setCurrentLike] = useState('')
  const [currentDislike, setCurrentDislike] = useState('')

  const addLike = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentLike.trim()) {
      e.preventDefault()
      if (!preferences.likes.includes(currentLike.trim())) {
        setPreferences(prev => ({
          ...prev,
          likes: [...prev.likes, currentLike.trim()]
        }))
      }
      setCurrentLike('')
    }
  }

  const removeLike = (item: string) => {
    setPreferences(prev => ({
      ...prev,
      likes: prev.likes.filter((i: string) => i !== item)
    }))
  }

  const addDislike = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentDislike.trim()) {
      e.preventDefault()
      if (!preferences.dislikes.includes(currentDislike.trim())) {
        setPreferences(prev => ({
          ...prev,
          dislikes: [...prev.dislikes, currentDislike.trim()]
        }))
      }
      setCurrentDislike('')
    }
  }

  const removeDislike = (item: string) => {
    setPreferences(prev => ({
      ...prev,
      dislikes: prev.dislikes.filter((i: string) => i !== item)
    }))
  }

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.preferences.title')}</h2>
        <p className="mt-2 text-gray-600">{t('onboarding.preferences.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Likes Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.preferences.likesLabel')}</label>
          <input
            type="text"
            value={currentLike}
            onChange={e => setCurrentLike(e.target.value)}
            onKeyDown={addLike}
            placeholder={t('onboarding.preferences.likesPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {preferences.likes.map((item: string) => (
              <Chip
                key={item}
                label={item}
                onRemove={() => removeLike(item)}
              />
            ))}
          </div>
        </div>

        {/* Dislikes Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.preferences.dislikesLabel')}</label>
          <input
            type="text"
            value={currentDislike}
            onChange={e => setCurrentDislike(e.target.value)}
            onKeyDown={addDislike}
            placeholder={t('onboarding.preferences.dislikesPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {preferences.dislikes.map((item: string) => (
              <Chip
                key={item}
                label={item}
                onRemove={() => removeDislike(item)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8 gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
           {t('onboarding.back')}
          </button>
        )}
        <button
          onClick={() => onNext(preferences)}
          className="group relative flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
        >
          {t('onboarding.preferences.next')} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// Step 5: Medical Details and Notes
export const MedicalDetailsInput = ({ onComplete, onBack, initialData }: { onComplete: (data: any) => void, onBack?: () => void, initialData: any }) => {
  const { t } = useTranslation()
  const [details, setDetails] = useState({
    medical_conditions: initialData?.medical_conditions || '',
    surgeries: Array.isArray(initialData?.surgeries) ? initialData.surgeries : [],
    notes: initialData?.notes || ''
  })
  
  // State for new surgery form
  const [newSurgery, setNewSurgery] = useState({
    body_part: '',
    name: '',
    severity: 1,
    status: 'active',
    limitations: '',
    diagnostic_date: '',
    recovery_date: ''
  })

  const handleAddSurgery = () => {
    if (newSurgery.body_part && newSurgery.name) {
      setDetails(prev => ({
        ...prev,
        surgeries: [...prev.surgeries, { ...newSurgery }]
      }))
      // Reset form
      setNewSurgery({
        body_part: '',
        name: '',
        severity: 1,
        status: 'active',
        limitations: '',
        diagnostic_date: '',
        recovery_date: ''
      })
    }
  }

  const removeSurgery = (index: number) => {
    setDetails(prev => ({
      ...prev,
      surgeries: prev.surgeries.filter((_: any, i: number) => i !== index)
    }))
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.medical.title')}</h2>
        <p className="mt-2 text-gray-600">{t('onboarding.medical.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.medical.conditionsLabel')}</label>
           <textarea
             value={details.medical_conditions}
             onChange={e => setDetails(prev => ({ ...prev, medical_conditions: e.target.value }))}
             placeholder={t('onboarding.medical.conditionsPlaceholder')}
             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-shadow"
           />
        </div>

        {/* Surgeries / Injuries Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
           <label className="block text-lg font-medium text-gray-900 mb-4">{t('onboarding.medical.surgeriesLabel')}</label>
           
           {/* Form to add new surgery */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.bodyPart')}</label>
               <input
                 type="text"
                 value={newSurgery.body_part}
                 onChange={e => setNewSurgery({ ...newSurgery, body_part: e.target.value })}
                 placeholder={t('onboarding.medical.surgeryFields.bodyPartPlaceholder')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.name')}</label>
               <input
                 type="text"
                 value={newSurgery.name}
                 onChange={e => setNewSurgery({ ...newSurgery, name: e.target.value })}
                 placeholder={t('onboarding.medical.surgeryFields.namePlaceholder')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               />
             </div>
             
             {/* Severity & Status */}
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.severity')}</label>
                <select
                  value={newSurgery.severity}
                  onChange={e => setNewSurgery({ ...newSurgery, severity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.status')}</label>
                <select
                  value={newSurgery.status}
                  onChange={e => setNewSurgery({ ...newSurgery, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="active">{t('onboarding.medical.surgeryFields.statusOptions.active')}</option>
                  <option value="recovered">{t('onboarding.medical.surgeryFields.statusOptions.recovered')}</option>
                  <option value="chronic">{t('onboarding.medical.surgeryFields.statusOptions.chronic')}</option>
                </select>
             </div>

             {/* Limitations */}
             <div className="md:col-span-2">
               <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.limitations')}</label>
               <input
                 type="text"
                 value={newSurgery.limitations}
                 onChange={e => setNewSurgery({ ...newSurgery, limitations: e.target.value })}
                 placeholder={t('onboarding.medical.surgeryFields.limitationsPlaceholder')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               />
             </div>
             
             {/* Date inputs - Optional */}
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.diagnosticDate')}</label>
               <input
                 type="date"
                 value={newSurgery.diagnostic_date}
                 onChange={e => setNewSurgery({ ...newSurgery, diagnostic_date: e.target.value })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">{t('onboarding.medical.surgeryFields.recoveryDate')}</label>
               <input
                 type="date"
                 value={newSurgery.recovery_date}
                 onChange={e => setNewSurgery({ ...newSurgery, recovery_date: e.target.value })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               />
             </div>

             <div className="md:col-span-2 flex justify-end">
               <button
                 type="button"
                 onClick={handleAddSurgery}
                 disabled={!newSurgery.body_part || !newSurgery.name}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {t('onboarding.medical.addSurgery')}
               </button>
             </div>
           </div>

           {/* List of added surgeries */}
           {details.surgeries.length > 0 && (
             <div className="space-y-2 max-h-48 overflow-y-auto">
                {details.surgeries.map((surgery: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{surgery.name} <span className="text-gray-500">({surgery.body_part})</span></p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">Severity: {surgery.severity}</span>
                         <span className={`px-2 py-0.5 rounded-full ${
                           surgery.status === 'active' ? 'bg-red-100 text-red-700' :
                           surgery.status === 'recovered' ? 'bg-green-100 text-green-700' :
                           'bg-yellow-100 text-yellow-700'
                         }`}>{surgery.status}</span>
                         {surgery.diagnostic_date && <span>Dx: {surgery.diagnostic_date}</span>}
                      </div>
                      {surgery.limitations && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{surgery.limitations}"</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeSurgery(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
             </div>
           )}
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.medical.notesLabel')}</label>
           <textarea
             value={details.notes}
             onChange={e => setDetails(prev => ({ ...prev, notes: e.target.value }))}
             placeholder={t('onboarding.medical.notesPlaceholder')}
             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-shadow"
           />
        </div>
      </div>

      <div className="flex justify-center pt-8 gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
           {t('onboarding.medical.back')}
          </button>
        )}
        <button
          onClick={() => onComplete(details)}
          className="group relative flex items-center justify-center px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30"
        >
          {t('onboarding.medical.complete')} <Check className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  )
}
