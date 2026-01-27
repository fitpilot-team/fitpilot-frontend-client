
import { Ruler, TrendingUp, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useClientHistory } from '@/features/users/services/users.queries'
import { PerformanceMetricModal } from './components/PerformanceMetricModal'
import type { MetricType } from './components/PerformanceMetricModal'

export function CompositionPage() {
  const { user } = useAuth()
  const { data: clientHistory, isLoading, error } = useClientHistory(user?.id);
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null)

  const compositionData = useMemo(() => {
    if (!clientHistory) return null

    const latestMetrics = clientHistory.client_metrics
        ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return {
        latest: latestMetrics,
        history: clientHistory.client_metrics
    }
  }, [clientHistory])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-emerald-600 font-medium">Loading composition data...</div>
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

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Ruler className="h-8 w-8 text-purple-600" />
                Body Composition
            </h1>
            <p className="text-gray-500 text-sm mt-1">Detailed breakdown of your physical metrics</p>
          </div>
      </header>

      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Weight" 
            value={compositionData?.latest?.weight_kg} 
            unit="kg" 
            icon={<Ruler className="h-5 w-5 text-purple-500" />}
            color="purple"
            onClick={() => setSelectedMetric('WEIGHT')}
          />
           <MetricCard 
            title="Body Fat" 
            value={compositionData?.latest?.body_fat_pct} 
            unit="%" 
            icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
            color="amber"
            onClick={() => setSelectedMetric('BODY_FAT')}
          />
           <MetricCard 
            title="Muscle Mass" 
            value={compositionData?.latest?.muscle_mass_kg} 
            unit="kg" 
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            color="emerald"
            onClick={() => setSelectedMetric('MUSCLE_MASS')}
          />
           <MetricCard 
            title="Visceral Fat" 
            value={compositionData?.latest?.visceral_fat} 
            unit="" 
            icon={<TrendingUp className="h-5 w-5 text-red-500" />}
            color="red"
            onClick={() => setSelectedMetric('VISCERAL_FAT')}
          />
      </div>

      {/* Anthropometric Measurements */}
      <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Ruler className="h-5 w-5 text-gray-400" />
             <h3 className="text-lg font-bold text-gray-900">Anthropometric Measurements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard title="Waist" value={compositionData?.latest?.waist_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-blue-500" />} color="blue" onClick={() => setSelectedMetric('WAIST')} />
              <MetricCard title="Hip" value={compositionData?.latest?.hip_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-indigo-500" />} color="indigo" onClick={() => setSelectedMetric('HIP')} />
              <MetricCard title="Chest" value={compositionData?.latest?.chest_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-cyan-500" />} color="cyan" onClick={() => setSelectedMetric('CHEST')} />
              
              <MetricCard title="Left Arm" value={compositionData?.latest?.arm_left_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-teal-500" />} color="teal" onClick={() => setSelectedMetric('ARM_LEFT')} />
              <MetricCard title="Right Arm" value={compositionData?.latest?.arm_right_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-teal-500" />} color="teal" onClick={() => setSelectedMetric('ARM_RIGHT')} />
              
              <MetricCard title="Left Thigh" value={compositionData?.latest?.thigh_left_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-emerald-500" />} color="emerald" onClick={() => setSelectedMetric('THIGH_LEFT')} />
              <MetricCard title="Right Thigh" value={compositionData?.latest?.thigh_right_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-emerald-500" />} color="emerald" onClick={() => setSelectedMetric('THIGH_RIGHT')} />
              
              <MetricCard title="Left Calf" value={compositionData?.latest?.calf_left_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-green-500" />} color="green" onClick={() => setSelectedMetric('CALF_LEFT')} />
              <MetricCard title="Right Calf" value={compositionData?.latest?.calf_right_cm} unit="cm" icon={<Ruler className="h-4 w-4 text-green-500" />} color="green" onClick={() => setSelectedMetric('CALF_RIGHT')} />
          </div>
      </div>

       {/* Detailed Stats Grid - Extending with more data if available or just simpler list */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-6 border-b border-gray-50 flex items-center gap-2">
               <Info className="h-5 w-5 text-gray-400" />
               <h3 className="text-lg font-bold text-gray-900">Detailed History</h3>
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                       <tr>
                           <th className="px-6 py-3 font-medium">Date</th>
                           <th className="px-6 py-3 font-medium">Weight</th>
                           <th className="px-6 py-3 font-medium">Fat %</th>
                           <th className="px-6 py-3 font-medium">Muscle</th>
                           <th className="px-6 py-3 font-medium">Waist</th>
                           <th className="px-6 py-3 font-medium">Hip</th>
                           <th className="px-6 py-3 font-medium">Chest</th>
                           <th className="px-6 py-3 font-medium">Arms (L/R)</th>
                           <th className="px-6 py-3 font-medium">Thighs (L/R)</th>
                           <th className="px-6 py-3 font-medium">Calves (L/R)</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                       {compositionData?.history?.map((record: any, idx: number) => (
                           <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                               <td className="px-6 py-4 font-medium text-gray-900">
                                   {new Date(record.date).toLocaleDateString()}
                               </td>
                               <td className="px-6 py-4 text-gray-600">{record.weight_kg ? `${record.weight_kg} kg` : '-'}</td>
                               <td className="px-6 py-4 text-gray-600">{record.body_fat_pct ? `${record.body_fat_pct}%` : '-'}</td>
                               <td className="px-6 py-4 text-gray-600">{record.muscle_mass_kg ? `${record.muscle_mass_kg} kg` : '-'}</td>
                               <td className="px-6 py-4 text-gray-600">{record.waist_cm || '-'}</td>
                               <td className="px-6 py-4 text-gray-600">{record.hip_cm || '-'}</td>
                               <td className="px-6 py-4 text-gray-600">{record.chest_cm || '-'}</td>
                               <td className="px-6 py-4 text-gray-600">
                                   {record.arm_left_cm || '-'} / {record.arm_right_cm || '-'}
                               </td>
                               <td className="px-6 py-4 text-gray-600">
                                   {record.thigh_left_cm || '-'} / {record.thigh_right_cm || '-'}
                               </td>
                               <td className="px-6 py-4 text-gray-600">
                                   {record.calf_left_cm || '-'} / {record.calf_right_cm || '-'}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>

        <PerformanceMetricModal 
            isOpen={!!selectedMetric}
            onClose={() => setSelectedMetric(null)}
            metricType={selectedMetric}
            data={clientHistory || {}}
         />
    </div>
  )
}

function MetricCard({ title, value, unit, icon, color, onClick }: any) {
    const colorClasses: any = {
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        red: "bg-red-50 text-red-700 border-red-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
        cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
        teal: "bg-teal-50 text-teal-700 border-teal-100",
        green: "bg-green-50 text-green-700 border-green-100",
    }

    return (
        <div 
            onClick={onClick}
            className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:scale-[1.02] duration-200`}
        >
             <div className="flex justify-between items-start mb-4 relative z-10">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${colorClasses[color]}`}>
                     {title}
                 </span>
                 <div className="p-2 bg-gray-50 rounded-full">
                    {icon}
                 </div>
             </div>
             <div className="relative z-10">
                <div className="text-3xl font-bold text-gray-900 tracking-tight">
                    {value || '-'} <span className="text-sm font-medium text-gray-400">{unit}</span>
                </div>
             </div>
        </div>
    )
}
