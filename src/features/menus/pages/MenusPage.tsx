
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menusService, type MenuMeal, type MenuItem, type FoodNutritionValue } from '../services/menus.service';
import { authService } from '../../auth/services/auth.service';
import { Calendar as CalendarIcon, Utensils, X, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const MenusPage: React.FC = () => {
    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: authService.getMe
    });

    const clientId = user?.id?.toString();

    const { data: menus, isLoading, error } = useQuery({
        queryKey: ['menus', clientId],
        queryFn: () => menusService.getMenus(clientId),
        enabled: !!clientId
    });

    // State for selected item (and panel)
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<MenuMeal | null>(null);

    // State for selected date. Default to today.
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Generate days for the selector (e.g., current week)
    const weekDays = useMemo(() => {
        const days = [];
        // Start from 3 days ago to 3 days ahead, or just current week. 
        // Let's do a sliding window of 7 days centered on selectedDate or today?
        // User asked for "dias de la semana", usually implying fixed Mon-Sun or dynamic window.
        // Let's do a dynamic window of +/- 3 days from "current focus" or just fixed current week.
        // Let's try 7 days centered on today, or better: 
        // Let's keep it simple: today - 3 to today + 3
        const start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() - 3);
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [selectedDate]);

    // Helper to check if a date matches the selected date (ignoring time)
    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    // Filter menus active on selectedDate
    const activeMeals = useMemo(() => {
        if (!menus) return [];

        const target = new Date(selectedDate);
        target.setHours(0, 0, 0, 0);

        // Find menus that include this date
        const activeMenus = menus.filter(menu => {
            const start = new Date(menu.start_date);
            const end = new Date(menu.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return target >= start && target <= end;
        });

        // Collect all meals from active menus
        // Flatten array of meals
        return activeMenus.flatMap(m => m.menu_meals);
    }, [menus, selectedDate]);


    if (isLoading) return <div className="flex justify-center p-8 text-emerald-600">Loading menus...</div>;
    if (error) return <div className="text-red-500 p-4">Error loading menus</div>;



    const formatDayName = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);
    };
     const formatDayNumber = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', { day: 'numeric' }).format(date);
    };





    return (
        <div className="flex h-full overflow-hidden bg-gray-50">
           
           {/* Main Content Area */}
            <div className={`
                flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${selectedItem ? 'w-[65%] shrink-0 pr-6' : 'w-full'}
            `}>
                <div className="w-full p-4 sm:p-6 lg:p-8 h-full overflow-y-auto no-scrollbar">
                    
                    <header className="flex items-center justify-between mb-8">
                        <div>
                        <h1 className="text-2xl font-bold text-gray-900">Plan de Alimentación</h1>
                        <p className="text-gray-500 text-sm">Organiza tus comidas diarias</p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                            <CalendarIcon size={20} />
                        </div>
                    </header>

                    {/* Date Selector */}
                    <div className="relative mb-8">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar gap-3">
                            {weekDays.map((date, index) => {
                                const isSelected = isSameDate(date, selectedDate);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex flex-col items-center justify-center min-w-[4rem] h-20 rounded-xl transition-all duration-200 border ${
                                            isSelected
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-emerald-500 scale-105'
                                                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className={`text-xs font-medium uppercase mb-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                            {formatDayName(date)}
                                        </span>
                                        <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                            {formatDayNumber(date)}
                                        </span>
                                        {isSameDate(date, new Date()) && (
                                            <div className={`mt-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Meals List */}
                    {activeMeals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center shadow-sm">
                            <div className="bg-emerald-50 p-4 rounded-full mb-4">
                                <Utensils className="w-8 h-8 text-emerald-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Día Libre</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                No hay comidas programadas para este día.
                            </p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 transition-all duration-500 ${selectedItem ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                            {activeMeals.map((meal) => (
                                <MealCard 
                                    key={meal.id} 
                                    meal={meal} 
                                    onSelectItem={(item, meal) => {
                                        setSelectedItem(item);
                                        setSelectedMeal(meal);
                                    }}
                                    selectedId={selectedItem?.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            <div 
                className={`
                    border-l border-gray-200 bg-white h-full shadow-2xl z-20 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden
                    ${selectedItem ? 'w-[35%] translate-x-0 opacity-100' : 'w-0 translate-x-20 opacity-0'}
                `}
            >
                <div className="h-full min-w-[350px]">
                    <NutrientPanel 
                        selectedMeal={selectedMeal} 
                        dailyMeals={activeMeals}
                        onClose={() => {
                            setSelectedItem(null);
                            setSelectedMeal(null);
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};



const calculateItemCalories = (item: MenuItem): number => {
    const { foods, quantity } = item;
    if (!foods) return 0;

    let calVal = foods.calories_kcal;
    let baseServingVal = foods.base_serving_size;
    let baseUnitVal = foods.base_unit;

    // Fallback to food_nutrition_values if top-level is missing
    if (!calVal && foods.food_nutrition_values && foods.food_nutrition_values.length > 0) {
        // Prefer 'standard' or just take the first one
        const fnv = foods.food_nutrition_values.find(v => v.state === 'standard') || foods.food_nutrition_values[0];
        calVal = fnv.calories_kcal;
        baseServingVal = fnv.base_serving_size;
        baseUnitVal = fnv.base_unit;
    }

    if (!calVal) return 0;
    
    const kcalPerServing = parseFloat(calVal);
    let baseServing = baseServingVal ? parseFloat(baseServingVal) : 0;
    
    if (baseServing === 0 || isNaN(baseServing)) {
        if (baseUnitVal === 'g' || baseUnitVal === 'ml') {
            baseServing = 100;
        } else {
            baseServing = 1;
        }
    }

    if (isNaN(kcalPerServing)) return 0;

    return (quantity / baseServing) * kcalPerServing;
};

// Helper for other macros
const calculateItemMacro = (item: MenuItem, field: keyof FoodNutritionValue): number => {
     const { foods, quantity } = item;
     if (!foods) return 0;

     let valStr: string | null | undefined = foods[field as keyof typeof foods] as string | null;
     let baseServingVal = foods.base_serving_size;
     let baseUnitVal = foods.base_unit;

     // Fallback to food_nutrition_values
     if (!valStr && foods.food_nutrition_values && foods.food_nutrition_values.length > 0) {
        const fnv = foods.food_nutrition_values.find(v => v.state === 'standard') || foods.food_nutrition_values[0];
        // fnv[field] ... but field might not exist on fnv if passed generically from FoodNutritionValue which is correct
        valStr = fnv[field] as string | null;
        baseServingVal = fnv.base_serving_size;
        baseUnitVal = fnv.base_unit;
     }

     if (!valStr || typeof valStr !== 'string') return 0;

     const valPerServing = parseFloat(valStr);
     let baseServing = baseServingVal ? parseFloat(baseServingVal) : 0;
      if (baseServing === 0 || isNaN(baseServing)) {
        if (baseUnitVal === 'g' || baseUnitVal === 'ml') {
            baseServing = 100;
        } else {
            baseServing = 1;
        }
    }
    if (isNaN(valPerServing)) return 0;
    return (quantity / baseServing) * valPerServing;
}



const calculateMealMacro = (meal: MenuMeal, field: keyof FoodNutritionValue): number => {
    return meal.menu_items_menu_items_menu_meal_idTomenu_meals.reduce((acc, item) => acc + calculateItemMacro(item, field), 0);
}

const calculateDailyCalories = (meals: MenuMeal[]): number => {
    return meals.reduce((acc, meal) => acc + (meal.total_calories || 0), 0);
}

const calculateDailyGlycemicLoad = (meals: MenuMeal[]): number => {
    return meals.reduce((acc, meal) => acc + (meal.total_glycemic_load || 0), 0);
}

const calculateDailyMacro = (meals: MenuMeal[], field: keyof FoodNutritionValue): number => {
    return meals.reduce((acc, meal) => acc + calculateMealMacro(meal, field), 0);
}


const MealCard: React.FC<{ meal: MenuMeal; onSelectItem: (item: MenuItem, meal: MenuMeal) => void; selectedId?: number }> = ({ meal, onSelectItem, selectedId }) => {
    const totalItems = meal.menu_items_menu_items_menu_meal_idTomenu_meals.length;
    


    return (
        <div className="group relative bg-white rounded-3xl p-1 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />
            
            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 cursor-pointer" onClick={() => onSelectItem(meal.menu_items_menu_items_menu_meal_idTomenu_meals[0], meal)}> 
                    {/* Clicking header selects the meal (using first item as dummy proxy or just passing meal if we refactor handler) */}
                    {/* Actually, let's keep it simple: pass null item for 'Meal Selection' if we update types, or just select first item to trigger context */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                                {meal.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {totalItems} {totalItems === 1 ? 'alimento' : 'alimentos'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                            <Utensils size={14} className="stroke-[3]" />
                            <span className="font-bold text-sm">
                                {Math.round(meal.total_calories)} Kcal
                            </span>
                        </div>
                         <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-wider">CG</span>
                            <span className="font-bold text-sm">
                                {meal.total_glycemic_load}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Vertical Food List */}
                <div className="space-y-3">
                    {totalItems > 0 ? (
                        meal.menu_items_menu_items_menu_meal_idTomenu_meals.map((item) => {
                             const itemCalories = calculateItemCalories(item);
                             const isSelected = selectedId === item.id;
                             return (
                                <div 
                                    key={item.id} 
                                    onClick={(e) => { e.stopPropagation(); onSelectItem(item, meal); }}
                                    className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                                        isSelected 
                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-200' 
                                        : 'bg-gray-50/50 border-gray-100/50 hover:bg-white hover:shadow-sm hover:border-emerald-100'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-base shrink-0 border transition-colors ${isSelected ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <span className="font-bold">
                                            {item.foods.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-bold truncate pr-2 ${isSelected ? 'text-emerald-900' : 'text-gray-800'}`}>
                                                {item.foods.name}
                                            </h4>
                                            <span className={`text-xs font-semibold whitespace-nowrap ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {Math.round(itemCalories) > 0 ? `${Math.round(itemCalories)} kcal` : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.quantity} {item.foods.base_unit || 'g'} 
                                            <span className="mx-1.5 text-gray-300">|</span>
                                            {item.exchange_groups?.name}
                                        </p>
                                    </div>
                                    <div className={`transition-opacity duration-200 ${isSelected ? 'opacity-100 text-emerald-500' : 'opacity-0 text-gray-300'}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                             );
                        })
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400 font-medium italic">Sin alimentos registrados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface NutrientStatsProps {
    title: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    glycemicLoad?: number;
}

const NutrientCard: React.FC<NutrientStatsProps> = ({ title, calories, protein, carbs, fat, glycemicLoad }) => {
    // For Donut Chart
    const data = [
        { name: 'Carbs', value: carbs * 4, color: '#3b82f6' }, // Blue
        { name: 'Protein', value: protein * 4, color: '#ef4444' }, // Red
        { name: 'Fat', value: fat * 9, color: '#f59e0b' }, // Orange
    ];
    if (data.every(d => d.value === 0)) {
        data.push({ name: 'Empty', value: 1, color: '#e5e7eb' });
    }

    const totalMacKcal = (protein * 4) + (carbs * 4) + (fat * 9);
    const pPct = totalMacKcal ? Math.round((protein * 4 / totalMacKcal) * 100) : 0;
    const cPct = totalMacKcal ? Math.round((carbs * 4 / totalMacKcal) * 100) : 0;
    const fPct = totalMacKcal ? Math.round((fat * 9 / totalMacKcal) * 100) : 0;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
             <div className="text-center mb-6">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mx-auto mb-2">
                    {title}
                </span>
             </div>

             {/* Donut Chart */}
             <div className="relative h-48 w-full flex items-center justify-center mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-black text-gray-900">{Math.round(calories)}</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kcal</span>
                 </div>
             </div>

             {/* Macros List */}
             <div className="space-y-4">
                {/* Protein */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="font-bold text-gray-600 text-xs">PROTEÍNA</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{Math.round(protein)}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${pPct}%` }} />
                    </div>
                </div>

                {/* Carbs */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="font-bold text-gray-600 text-xs">CARBS</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{Math.round(carbs)}g</span>
                    </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cPct}%` }} />
                    </div>
                </div>

                {/* Fat */}
                 <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span className="font-bold text-gray-600 text-xs">GRASAS</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{Math.round(fat)}g</span>
                    </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fPct}%` }} />
                    </div>
                </div>
             </div>
             
              {glycemicLoad !== undefined && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Carga Glucémica</span>
                     <span className="text-sm font-black text-emerald-600">
                         {glycemicLoad}
                     </span>
                 </div>
              )}
        </div>
    );
}

// Helper to aggregate micros
const aggregateMicros = (meals: MenuMeal[]) => {
    const acc = new Map<number, { name: string; amount: number; unit: string; category: string }>();
    
    meals.forEach(m => {
        m.total_micronutrients?.forEach(micro => {
            const existing = acc.get(micro.id);
            if (existing) {
                existing.amount += micro.amount;
            } else {
                acc.set(micro.id, { ...micro });
            }
        });
    });

    // Convert to array and sort by category/name
    return Array.from(acc.values()).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
};

// Nutrient Panel Component
const NutrientPanel: React.FC<{ 
    selectedMeal: MenuMeal | null; 
    dailyMeals: MenuMeal[];
    onClose: () => void; 
}> = ({ selectedMeal, dailyMeals, onClose }) => {
    
    const [activeTab, setActiveTab] = useState<'macros' | 'micros'>('macros');

    const dailyMicros = useMemo(() => aggregateMicros(dailyMeals), [dailyMeals]);
    const mealMicros = useMemo(() => selectedMeal?.total_micronutrients || [], [selectedMeal]);

    if (!selectedMeal) return <div className="w-full text-center mt-20 text-gray-400">Selecciona un alimento</div>;

    // Meal stats
    const mealCals = selectedMeal.total_calories; // Use API provided total
    const mealProt = calculateMealMacro(selectedMeal, 'protein_g');
    const mealCarbs = calculateMealMacro(selectedMeal, 'carbs_g');
    const mealFat = calculateMealMacro(selectedMeal, 'fat_g');

    // Daily stats
    const dailyCals = calculateDailyCalories(dailyMeals);
    const dailyProt = calculateDailyMacro(dailyMeals, 'protein_g');
    const dailyCarbs = calculateDailyMacro(dailyMeals, 'carbs_g');
    const dailyFat = calculateDailyMacro(dailyMeals, 'fat_g');
    const dailyGL = calculateDailyGlycemicLoad(dailyMeals);

    return (
        <div className="h-full flex flex-col bg-gray-50/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
                <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-[200px]">
                    <button 
                        onClick={() => setActiveTab('macros')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md shadow-sm text-center transition-all ${activeTab === 'macros' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent shadow-none'}`}
                    >
                        MACROS
                    </button>
                    <button 
                        onClick={() => setActiveTab('micros')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md shadow-sm text-center transition-all ${activeTab === 'micros' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent shadow-none'}`}
                    >
                        MICROS
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="text-center mb-2">
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">
                        {activeTab === 'macros' ? 'Resumen Nutricional' : 'Micronutrientes'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {selectedMeal.name} vs. Plan Completo
                    </p>
                </div>

                {activeTab === 'macros' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <NutrientCard 
                            title={`COMIDA: ${selectedMeal.name.toUpperCase()}`}
                            calories={mealCals}
                            protein={mealProt}
                            carbs={mealCarbs}
                            fat={mealFat}
                            glycemicLoad={selectedMeal.total_glycemic_load}
                        />

                        <NutrientCard 
                            title="PLAN COMPLETO (DÍA)"
                            calories={dailyCals}
                            protein={dailyProt}
                            carbs={dailyCarbs}
                            fat={dailyFat}
                            glycemicLoad={dailyGL}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                         {/* Meal Micros */}
                         <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="text-center mb-4">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mx-auto">
                                    COMIDA: {selectedMeal.name.toUpperCase()}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {mealMicros.length > 0 ? (
                                    mealMicros.map((micro, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                            <div>
                                                <span className="text-sm font-bold text-gray-700 block">{micro.name}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">{micro.category}</span>
                                            </div>
                                            <div className="text-right">
                                                 <span className="text-sm font-bold text-gray-900">{parseFloat(micro.amount.toString()).toFixed(1)}</span>
                                                 <span className="text-xs text-gray-500 ml-1">{micro.unit}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 text-sm py-4 italic">No hay datos disponibles</div>
                                )}
                            </div>
                         </div>

                         {/* Daily Micros */}
                         <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="text-center mb-4">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mx-auto">
                                    PLAN COMPLETO (DÍA)
                                </span>
                            </div>
                            <div className="space-y-3">
                                {dailyMicros.length > 0 ? (
                                    dailyMicros.map((micro, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                            <div>
                                                <span className="text-sm font-bold text-gray-700 block">{micro.name}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">{micro.category}</span>
                                            </div>
                                            <div className="text-right">
                                                 <span className="text-sm font-bold text-gray-900">{micro.amount.toFixed(1)}</span>
                                                 <span className="text-xs text-gray-500 ml-1">{micro.unit}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 text-sm py-4 italic">No hay datos disponibles</div>
                                )}
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}


