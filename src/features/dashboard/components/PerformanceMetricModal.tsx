
import { X, TrendingUp, Calendar } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart
} from 'recharts'

export type MetricType = 'GLUCOSE' | 'BLOOD_PRESSURE' | 'HEART_RATE' | 'WEIGHT' | 'BODY_FAT' | 'MUSCLE_MASS' | 'VISCERAL_FAT' | 'WAIST' | 'HIP' | 'CHEST' | 'ARM_LEFT' | 'ARM_RIGHT' | 'THIGH_LEFT' | 'THIGH_RIGHT' | 'CALF_LEFT' | 'CALF_RIGHT'

interface PerformanceMetricModalProps {
  isOpen: boolean
  onClose: () => void
  metricType: MetricType | null
  data: any
}


export function PerformanceMetricModal({ isOpen, onClose, metricType, data }: PerformanceMetricModalProps) {
  const [timeRange, setTimeRange] = useState<'ALL' | '3M' | '6M'>('ALL')

  const chartConfig = useMemo(() => {
    if (!metricType || !data) return null

    let processedData = []
    let title = ''
    let color = ''
    let unit = ''
    let type = 'area' // 'area' or 'line'
    let dataKeys: any[] = [] // Array of { key, color, name }

    const healthMetrics = data.client_health_metrics || []
    const bodyMetrics = data.client_metrics || []

    switch (metricType) {
      case 'GLUCOSE':
        title = 'Glucose History'
        color = '#f43f5e' // rose-500
        unit = 'mg/dL'
        processedData = healthMetrics
            .filter((m: any) => m.glucose_mg_dl)
            .map((m: any) => ({
                originalDate: m.recorded_at,
                date: new Date(m.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                value: m.glucose_mg_dl,
                context: m.glucose_context
            }))
            .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
        dataKeys = [{ key: 'value', color: '#f43f5e', name: 'Glucose' }]
        break;

      case 'BLOOD_PRESSURE':
        title = 'Blood Pressure Trends'
        color = '#ef4444' // red-500
        unit = 'mmHg'
        type = 'line'
        processedData = healthMetrics
            .filter((m: any) => m.systolic_mmhg && m.diastolic_mmhg)
            .map((m: any) => ({
                originalDate: m.recorded_at,
                date: new Date(m.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                systolic: m.systolic_mmhg,
                diastolic: m.diastolic_mmhg
            }))
            .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
        dataKeys = [
            { key: 'systolic', color: '#ef4444', name: 'Systolic' },
            { key: 'diastolic', color: '#3b82f6', name: 'Diastolic' }
        ]
        break;

      case 'HEART_RATE':
        title = 'Heart Rate History'
        color = '#ec4899' // pink-500
        unit = 'BPM'
        processedData = healthMetrics
            .filter((m: any) => m.heart_rate_bpm)
            .map((m: any) => ({
                originalDate: m.recorded_at,
                date: new Date(m.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                value: m.heart_rate_bpm
            }))
            .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
        dataKeys = [{ key: 'value', color: '#ec4899', name: 'Heart Rate' }]
        break;

      case 'WEIGHT':
        title = 'Weight History'
        color = '#8b5cf6' // violet-500
        unit = 'kg'
        processedData = bodyMetrics
             .filter((m: any) => m.weight_kg)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.weight_kg
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#8b5cf6', name: 'Weight' }]
         break;

      case 'BODY_FAT':
        title = 'Body Fat Percentage'
        color = '#f59e0b' // amber-500
        unit = '%'
        processedData = bodyMetrics
             .filter((m: any) => m.body_fat_pct)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.body_fat_pct
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#f59e0b', name: 'Body Fat' }]
         break;

      case 'MUSCLE_MASS':
        title = 'Muscle Mass'
        color = '#10b981' // emerald-500
        unit = 'kg'
        processedData = bodyMetrics
             .filter((m: any) => m.muscle_mass_kg)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.muscle_mass_kg
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#10b981', name: 'Muscle Mass' }]
         break;

      case 'VISCERAL_FAT':
        title = 'Visceral Fat Level'
        color = '#ef4444' // red-500
        unit = ''
        processedData = bodyMetrics
             .filter((m: any) => m.visceral_fat)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.visceral_fat
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#ef4444', name: 'Visceral Fat' }]
         break;

      case 'WAIST':
        title = 'Waist Circumference'
        color = '#3b82f6' // blue-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.waist_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.waist_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#3b82f6', name: 'Waist' }]
         break;

      case 'HIP':
        title = 'Hip Circumference'
        color = '#6366f1' // indigo-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.hip_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.hip_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#6366f1', name: 'Hip' }]
         break;

      case 'CHEST':
        title = 'Chest Circumference'
        color = '#06b6d4' // cyan-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.chest_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.chest_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#06b6d4', name: 'Chest' }]
         break;

      case 'ARM_LEFT':
        title = 'Left Arm Circumference'
        color = '#14b8a6' // teal-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.arm_left_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.arm_left_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#14b8a6', name: 'Left Arm' }]
         break;

      case 'ARM_RIGHT':
        title = 'Right Arm Circumference'
        color = '#14b8a6' // teal-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.arm_right_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.arm_right_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#14b8a6', name: 'Right Arm' }]
         break;

      case 'THIGH_LEFT':
        title = 'Left Thigh Circumference'
        color = '#10b981' // emerald-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.thigh_left_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.thigh_left_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#10b981', name: 'Left Thigh' }]
         break;

      case 'THIGH_RIGHT':
        title = 'Right Thigh Circumference'
        color = '#10b981' // emerald-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.thigh_right_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.thigh_right_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#10b981', name: 'Right Thigh' }]
         break;

      case 'CALF_LEFT':
        title = 'Left Calf Circumference'
        color = '#22c55e' // green-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.calf_left_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.calf_left_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#22c55e', name: 'Left Calf' }]
         break;

      case 'CALF_RIGHT':
        title = 'Right Calf Circumference'
        color = '#22c55e' // green-500
        unit = 'cm'
        processedData = bodyMetrics
             .filter((m: any) => m.calf_right_cm)
             .map((m: any) => ({
                 originalDate: m.date,
                 date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                 value: m.calf_right_cm
             }))
             .sort((a: any, b: any) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
         dataKeys = [{ key: 'value', color: '#22c55e', name: 'Right Calf' }]
         break;
    }

    // Filter by time range if needed
    if (timeRange === '3M') {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        processedData = processedData.filter((d: any) => new Date(d.originalDate) >= threeMonthsAgo)
    } else if (timeRange === '6M') {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        processedData = processedData.filter((d: any) => new Date(d.originalDate) >= sixMonthsAgo)
    }

    return { title, color, unit, type, data: processedData, dataKeys }
  }, [metricType, data, timeRange])

  if (!isOpen || !metricType) return null

  // Helper for Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-500 capitalize">
                {entry.name}:
              </span>
              <span className="font-bold text-gray-900">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Refined Logic for Composition Data handling inside the switch
  // To avoid issues, let's just make sure we are parsing correctly based on what DashboardPage passes.
  // DashboardPage probably passes 'clientHistory' object.
  // Actually, 'clientHistory' is an object, not an array.
  // The hooks return an object which contains arrays 'client_metrics' and 'client_health_metrics'.
  // So 'data' prop should probably be the whole clientHistory object.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: chartConfig?.color }} />
              {chartConfig?.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Track your progress over time
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 flex gap-2 border-b border-gray-50">
             {(['ALL', '6M', '3M'] as const).map((range) => (
                 <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        timeRange === range 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                 >
                    {range === 'ALL' ? 'All Time' : `Last ${range}`}
                 </button>
             ))}
        </div>

        {/* Chart Area */}
        <div className="p-5 flex-1 min-h-[300px]">
          {chartConfig?.data && chartConfig.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                {chartConfig.type === 'area' ? (
                     <AreaChart data={chartConfig.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`color${metricType}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartConfig.color, strokeDasharray: '4 4' }} />
                        {chartConfig.dataKeys.map((k) => (
                             <Area
                                key={k.key}
                                type="monotone"
                                dataKey={k.key}
                                stroke={k.color}
                                strokeWidth={2}
                                fill={`url(#color${metricType})`}
                                name={k.name}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                        ))}
                     </AreaChart>
                ) : (
                    <LineChart data={chartConfig.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0' }} />
                         {chartConfig.dataKeys.map((k) => (
                             <Line
                                key={k.key}
                                type="monotone"
                                dataKey={k.key}
                                stroke={k.color}
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 0, fill: k.color }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name={k.name}
                              />
                        ))}
                    </LineChart>
                )}
             
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <Calendar className="w-10 h-10 mb-2 opacity-20" />
               <p className="text-sm">No history data available for this range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
