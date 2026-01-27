import { Calendar, Target, Ruler, Heart, Clock, TrendingUp, Activity, ChevronRight } from 'lucide-react'
  import { useMemo, useState } from 'react'
  import { useAuth } from '@/features/auth/context/AuthContext'
  import { useClientHistory } from '@/features/users/services/users.queries'
import { PerformanceMetricModal } from './components/PerformanceMetricModal'
import type { MetricType } from './components/PerformanceMetricModal'

  export function DashboardPage() {
    const { user } = useAuth()
    const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null)
    console.log('user', user);
    const { data: clientHistory, isLoading, error } = useClientHistory(user?.id);

    console.log('clientHistory',clientHistory)

    const dashboardData = useMemo(() => {
        if (!clientHistory) return null

        const upcomingAppointments = clientHistory.appointments
            ?.filter((a: any) => a.status === 'SCHEDULED' && new Date(a.scheduled_at) > new Date())
            .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0]

        const activeGoal = clientHistory.client_goals?.find((g: any) => g.is_primary)?.goals?.name

        const latestMetrics = clientHistory.client_metrics
            ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        const latestHealth = clientHistory.client_health_metrics
            ?.sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0]
            
        const preferences = clientHistory.client_records?.[0]?.preferences

        return {
            upcomingAppointment: upcomingAppointments,
            activeGoal,
            latestMetrics,
            latestHealth,
            preferences
        }
    }, [clientHistory])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-emerald-600 font-medium">Loading dashboard data...</div>
        </div>
      )
    }

    if (error) {
       return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-red-500">Error loading data. Please try again later.</div>
        </div>
      )
    }

    const userName = clientHistory?.name || user?.name || 'User'

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back, {userName} 👋</p>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upcoming Appointment Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-emerald-100 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="h-16 w-16 text-emerald-500 transform rotate-12" />
                </div>
                <div className="flex items-center justify-between mb-4 z-10">
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Next Session</span>
                    <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                {dashboardData?.upcomingAppointment ? (
                    <div className="mt-auto z-10">
                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                            {new Date(dashboardData.upcomingAppointment.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(dashboardData.upcomingAppointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                         <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Duration</span>
                            <span className="text-xs font-semibold text-gray-900">{dashboardData.upcomingAppointment.duration_minutes} min</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 mt-auto z-10 text-sm font-medium">No upcoming appointments</div>
                )}
            </div>

            {/* Active Goal Card */}
             <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-blue-100 flex flex-col relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="h-16 w-16 text-blue-500 transform -rotate-12" />
                </div>
                 <div className="flex items-center justify-between mb-4 z-10">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Current Focus</span>
                    <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mt-auto z-10 space-y-3">
                     <div>
                        <div className="text-xl font-bold text-gray-900 leading-tight">
                            {dashboardData?.activeGoal || 'No active goal set'}
                        </div>
                     </div>
                     {dashboardData?.preferences && (
                         <div className="pt-3 border-t border-gray-100">
                             <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 rounded-lg p-1.5 text-center">
                                    <span className="block text-lg font-bold text-green-600">{dashboardData.preferences.likes.length}</span>
                                    <span className="text-[10px] text-gray-500 font-medium uppercase">Likes</span>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-1.5 text-center">
                                     <span className="block text-lg font-bold text-red-600">{dashboardData.preferences.dislikes.length}</span>
                                    <span className="text-[10px] text-gray-500 font-medium uppercase">Dislikes</span>
                                </div>
                             </div>
                         </div>
                     )}
                </div>
             </div>

            {/* Body Composition Card */}
            <div 
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-purple-100 flex flex-col relative overflow-hidden group"
            >
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Ruler className="h-16 w-16 text-purple-500 transform rotate-12" />
                </div>
                 <div className="flex items-center justify-between mb-4 z-10">
                    <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Composition</span>
                        <a href="/composition" className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 transition-colors">
                            View More <ChevronRight className="h-3 w-3" />
                        </a>
                    </div>
                    <Ruler className="h-5 w-5 text-purple-600" />
                </div>
                {dashboardData?.latestMetrics ? (
                     <div className="grid grid-cols-2 gap-3 mt-auto z-10">
                        <div 
                            onClick={() => setSelectedMetric('WEIGHT')}
                            className="bg-gray-50 p-2.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <span className="text-[10px] text-gray-500 font-semibold uppercase block mb-0.5">Weight</span>
                            <span className="text-lg font-bold text-gray-900">{dashboardData.latestMetrics.weight_kg} <span className="text-[10px] text-gray-500 font-normal">kg</span></span>
                        </div>
                         <div 
                            onClick={() => setSelectedMetric('BODY_FAT')}
                            className="bg-gray-50 p-2.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                         >
                            <span className="text-[10px] text-gray-500 font-semibold uppercase block mb-0.5">Body Fat</span>
                            <span className="text-lg font-bold text-gray-900">{dashboardData.latestMetrics.body_fat_pct}<span className="text-[10px] text-gray-500 font-normal">%</span></span>
                        </div>
                          <div 
                             onClick={() => setSelectedMetric('MUSCLE_MASS')}
                             className="bg-gray-50 p-2.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                          >
                            <span className="text-[10px] text-gray-500 font-semibold uppercase block mb-0.5">Muscle</span>
                            <span className="text-lg font-bold text-gray-900">{dashboardData.latestMetrics.muscle_mass_kg} <span className="text-[10px] text-gray-500 font-normal">kg</span></span>
                        </div>
                          <div 
                             onClick={() => setSelectedMetric('VISCERAL_FAT')}
                             className="bg-gray-50 p-2.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                          >
                            <span className="text-[10px] text-gray-500 font-semibold uppercase block mb-0.5">Visceral</span>
                            <span className="text-lg font-bold text-gray-900">{dashboardData.latestMetrics.visceral_fat}</span>
                        </div>
                     </div>
                ) : (
                    <div className="text-gray-400 mt-auto z-10 text-sm font-medium">No measurements recorded</div>
                )}
            </div>
            
            {/* Health Metrics - Full Width on Mobile, Span 2 on Desktop */}
            <div className="lg:col-span-2 bg-gradient-to-br from-white to-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div>
                         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                             <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                             Latest Vitals
                         </h3>
                         <p className="text-gray-500 text-xs mt-0.5">Recorded on {dashboardData?.latestHealth ? new Date(dashboardData.latestHealth.recorded_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>

                {dashboardData?.latestHealth ? (
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         {dashboardData.latestHealth.glucose_mg_dl && (
                             <div 
                                onClick={() => setSelectedMetric('GLUCOSE')}
                                className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-rose-200 transition-all"
                             >
                                 <div className="text-gray-500 text-xs font-medium mb-1">Glucose</div>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{dashboardData.latestHealth.glucose_mg_dl}</span>
                                    <span className="text-[10px] text-gray-500">mg/dL</span>
                                 </div>
                                 <div className="text-[10px] text-rose-400 font-medium mt-1 bg-rose-50 inline-block px-1.5 py-0.5 rounded w-fit">
                                    {dashboardData.latestHealth.glucose_context}
                                 </div>
                             </div>
                         )}

                         {dashboardData.latestHealth.systolic_mmhg && (
                              <div 
                                onClick={() => setSelectedMetric('BLOOD_PRESSURE')}
                                className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-rose-200 transition-all"
                              >
                                 <div className="text-gray-500 text-xs font-medium mb-1">Blood Pressure</div>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{dashboardData.latestHealth.systolic_mmhg}/{dashboardData.latestHealth.diastolic_mmhg}</span>
                                    <span className="text-[10px] text-gray-500">mmHg</span>
                                 </div>
                             </div>
                         )}

                          {dashboardData.latestHealth.heart_rate_bpm && (
                              <div 
                                onClick={() => setSelectedMetric('HEART_RATE')}
                                className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-rose-200 transition-all"
                              >
                                 <div className="text-gray-500 text-xs font-medium mb-1">Heart Rate</div>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{dashboardData.latestHealth.heart_rate_bpm}</span>
                                    <span className="text-[10px] text-gray-500">BPM</span>
                                 </div>
                                  <div className="mt-1 text-rose-500">
                                      <Activity className="h-4 w-4 animate-pulse" />
                                  </div>
                             </div>
                         )}
                     </div>
                ) : (
                     <div className="text-gray-400 py-6 text-center text-sm font-medium">No vital signs recorded recently</div>
                )}
            </div>

             {/* Placeholder for Progress Chart */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                 <div className="bg-orange-50 p-3 rounded-full mb-3">
                     <TrendingUp className="h-6 w-6 text-orange-500" />
                 </div>
                 <h3 className="font-bold text-gray-900 text-base">Activity & Progress</h3>
                 <p className="text-gray-500 text-xs mt-1 max-w-xs">Detailed visualizations of your progress are coming soon.</p>
             </div>
        </div>
        
         <PerformanceMetricModal 
            isOpen={!!selectedMetric}
            onClose={() => setSelectedMetric(null)}
            metricType={selectedMetric}
            data={clientHistory || {}}
         />

         {/* Debug Info */}
         <details className="mt-8 p-3 bg-gray-50 rounded-lg text-[10px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border border-dashed border-gray-200">
            <summary className="font-medium flex items-center gap-2 select-none">
                <span>Debugger Info</span>
            </summary>
            <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-40 bg-white p-3 rounded border border-gray-100">{JSON.stringify(clientHistory, null, 2)}</pre>
         </details>
      </div>
    )
  }
