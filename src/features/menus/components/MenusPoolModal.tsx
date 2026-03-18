import React from 'react';
import { type Menu } from '../services/menus.service';
import { X, Utensils, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MenusPoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    menus: Menu[];
    date: Date;
    onSelect: (menu: Menu) => void;
    isSwapping?: boolean;
    isLoading?: boolean;
}

export const MenusPoolModal: React.FC<MenusPoolModalProps> = ({ isOpen, onClose, menus: menuPool, date, onSelect, isSwapping = false, isLoading = false }) => {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const error = null;


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={!isSwapping ? onClose : undefined}
            />
            
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Loading Overlay */}
                {isSwapping && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                        <p className="font-bold text-gray-900 text-lg">Cambiando menú...</p>
                        <p className="text-gray-500 text-sm">Por favor espera un momento</p>
                    </div>
                )}
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                           <Utensils className="text-emerald-500" size={24}/>
                           Cambiar Menú
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Selecciona una opción disponible para el {new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(date)}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 w-20 bg-gray-100 rounded-full"></div>
                                            <div className="h-6 w-48 bg-gray-100 rounded-lg"></div>
                                        </div>
                                        <div className="h-6 w-6 rounded-full bg-gray-100"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                                        <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                                        <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 px-4">
                            <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-2 inline-block">
                                <X size={32} />
                            </div>
                            <p className="text-gray-900 font-bold mb-1">Error al cargar opciones</p>
                            <p className="text-sm text-gray-500">Intenta nuevamente más tarde.</p>
                        </div>
                    ) : !menuPool || menuPool.length === 0 ? (
                         <div className="text-center py-12 px-4">
                            <div className="bg-gray-100 text-gray-400 p-4 rounded-2xl mb-2 inline-block">
                                <Utensils size={32} />
                            </div>
                            <p className="text-gray-900 font-bold mb-1">No hay menus disponibles</p>
                            <p className="text-sm text-gray-500">Tu nutriólogo no ha asignado opciones para este día.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {menuPool.map((menu, index) => (
                                <button
                                    key={menu.id}
                                    onClick={() => {
                                        console.log('Clicked menu option:', menu.id);
                                        onSelect(menu);
                                    }}
                                    className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 text-left transition-all duration-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                    Opción {index + 1}
                                                </span>
                                                {menu.title && (
                                                     <h3 className="font-bold text-gray-900 text-lg">
                                                        {menu.title}
                                                     </h3>
                                                )}
                                            </div>
                                            
                                            {/* Preview meals summary */}
                                             <div className="flex flex-wrap gap-2 mt-3">
                                                {menu.menu_meals.sort((a,b) => a.id - b.id).map(meal => (
                                                    <div key={meal.id} className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                        <span className="font-semibold text-gray-700">{meal.name}:</span> {meal.total_calories ? Math.round(meal.total_calories) : 0} kcal
                                                    </div>
                                                ))}
                                             </div>
                                        </div>

                                        <div className="ml-4 flex h-full items-center">
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                                                 <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/10 rounded-2xl pointer-events-none" />
                                    
                                    {/* Footer / Toggle Detail */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center w-full relative z-10">
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(menu.id);
                                            }}
                                            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-emerald-600 cursor-pointer transition-colors px-3 py-1 bg-gray-50 hover:bg-emerald-50 rounded-full"
                                        >
                                            {expandedIds.includes(menu.id) ? (
                                                <>
                                                    <ChevronUp size={14} />
                                                    <span>Ocultar detalle</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown size={14} />
                                                    <span>Ver detalle</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Detail View */}
                                    {expandedIds.includes(menu.id) && (
                                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {menu.menu_meals.sort((a,b) => a.id - b.id).map(meal => (
                                                <div key={meal.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-gray-800 text-sm">{meal.name}</span>
                                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                                            {Math.round(meal.total_calories || 0)} kcal
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {meal.menu_items_menu_items_menu_meal_idTomenu_meals.length > 0 ? (
                                                            meal.menu_items_menu_items_menu_meal_idTomenu_meals.map(item => (
                                                                <div key={item.id} className="flex justify-between text-xs text-gray-600 pl-2 border-l-2 border-gray-200 py-0.5">
                                                                    <span>{item.foods.name}</span>
                                                                    <span className="font-medium text-gray-500">
                                                                        {item.quantity} {item.foods.base_unit || 'g'}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs text-gray-400 italic pl-2">Sin alimentos</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
