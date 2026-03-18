import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menusService, type Food, type MenuItem } from '../services/menus.service';
import { X, Search, RefreshCw, ArrowRight, Utensils } from 'lucide-react';

interface SwapFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (newFood: Food, calculatedQuantity: number) => void;
    currentItem: MenuItem;
}

export const SwapFoodModal: React.FC<SwapFoodModalProps> = ({ isOpen, onClose, onSelect, currentItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { data: foods, isLoading } = useQuery({
        queryKey: ['foods-exchange', currentItem.foods.exchange_group_id],
        queryFn: () => menusService.getFoodsByExchangeGroup(currentItem.foods.exchange_group_id),
        enabled: isOpen && !!currentItem.foods.exchange_group_id,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const filteredFoods = foods?.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        food.id !== currentItem.foods.id // Exclude current food
    ) || [];

    // Auto-focus on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Reset selection on search
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = itemRefs.current[selectedIndex];
        if (selectedElement && containerRef.current) {
            selectedElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!filteredFoods.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredFoods.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredFoods.length) % filteredFoods.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelect(filteredFoods[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    // Calculation Logic
    const calculateQuantity = (targetFood: Food): number => {
        // Try calculating using Equivalent Quantity (Exchanges)
        if (currentItem.equivalent_quantity && currentItem.exchange_groups?.avg_calories) {
            const equivQty = parseFloat(currentItem.equivalent_quantity);
            const avgCal = currentItem.exchange_groups.avg_calories;
            
            // Get Target Food Calories Info from Nutrition Values (preferred) or Food root
            // Some foods might not have nutrition values array populated or it might be empty
            const fnv = targetFood.food_nutrition_values?.find(v => v.state === 'standard') || targetFood.food_nutrition_values?.[0];
            
            const targetCalStr = fnv?.calories_kcal || targetFood.calories_kcal;
            const targetBaseSizeStr = fnv?.base_serving_size || targetFood.base_serving_size;
            
            if (targetCalStr) {
                const targetCal = parseFloat(targetCalStr);
                
                // Determine base serving (default to 100g/ml if missing/invalid, standard for DBs)
                let targetBaseSize = targetBaseSizeStr ? parseFloat(targetBaseSizeStr) : 100;
                if (isNaN(targetBaseSize) || targetBaseSize <= 0) targetBaseSize = 100;

                if (!isNaN(targetCal) && targetCal > 0) {
                     // Total Calories Target = (Exchanges * AvgCalPerExchange)
                    const totalTargetCal = equivQty * avgCal;
                    
                    // Grams = TotalTargetCal / (CaloriesPerBaseServing / BaseServing)
                    // Grams = TotalTargetCal * (BaseServing / CaloriesPerBaseServing)
                    return totalTargetCal * (targetBaseSize / targetCal);
                }
            }
        }

        // Fallback: Old Logic (Serving Size Ratio)
        const oldQty = currentItem.quantity;
        const oldServing = parseFloat(currentItem.foods.base_serving_size || '0');
        const safeOldServing = (oldServing && oldServing > 0) ? oldServing : 1; 
        const newServing = parseFloat(targetFood.base_serving_size || '0');
        const safeNewServing = (newServing && newServing > 0) ? newServing : 0; 

        if (safeNewServing === 0) return 0;
        return (oldQty / safeOldServing) * safeNewServing;
    };

    const handleSelect = (food: Food) => {
        const newQty = calculateQuantity(food);
        onSelect(food, newQty);
        onClose();
    };

    const getUnit = (food: Food) => food.base_unit || 'g';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                           <RefreshCw size={20} className="text-emerald-500" />
                           Cambiar Alimento
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Elige una alternativa del grupo <span className="font-semibold text-emerald-600">{currentItem.exchange_groups?.name}</span>
                        </p>
                    </div>
                   
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Current Item Summary */}
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b border-gray-100 text-sm">
                    <span className="font-medium text-gray-500">Alimento actual:</span>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span>{currentItem.foods.name}</span>
                        <span className="text-gray-300">|</span>
                        <span>{currentItem.quantity} {getUnit(currentItem.foods)}</span>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Buscar alimento..." 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all border-none font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* List */}
                <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span className="text-sm">Cargando alimentos...</span>
                        </div>
                    ) : filteredFoods.length > 0 ? (
                        filteredFoods.map((food, index) => {
                            const calculatedQty = calculateQuantity(food);
                            const isKeyboardSelected = index === selectedIndex;
                            
                            return (
                                <div 
                                    key={food.id}
                                    ref={(el) => { itemRefs.current[index] = el; }}
                                    onClick={() => handleSelect(food)}
                                    className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                                        isKeyboardSelected 
                                            ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-200' 
                                            : 'hover:bg-gray-50 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Image Placeholder */}
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200 shadow-inner group-hover:bg-white group-hover:border-emerald-100 group-hover:text-emerald-500 transition-all">
                                            <Utensils size={20} />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-900">{food.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-lg group-hover:bg-emerald-100/50 group-hover:text-emerald-700">
                                                    {food.base_serving_size || 0} {getUnit(food)} / porción
                                                </span>
                                                {food.brand && (
                                                    <span className="text-xs text-gray-400">• {food.brand}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Equivalente</span>
                                            <span className="text-lg font-black text-emerald-600">
                                                {Math.round(calculatedQty)} <span className="text-xs font-bold text-emerald-400 ml-0.5">{getUnit(food)}</span>
                                            </span>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                            isKeyboardSelected 
                                                ? 'bg-emerald-500 text-white border-emerald-500' 
                                                : 'bg-white border border-gray-100 text-gray-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500'
                                        }`}>
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                             <p>No se encontraron alimentos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
