import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
    markedDates?: Date[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onDateSelect, onClose, markedDates }) => {
    // State for the currently displayed month
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        // Adjust for Monday start (0 = Sunday, 1 = Monday, ...)
        // If we want Monday to be 0 for array index purposes:
        let day = new Date(year, month, 1).getDay();
        // day: 0 (Sun), 1 (Mon), ... 6 (Sat)
        // Convert to Monday start: Mon(1)->0, Tue(2)->1, ..., Sun(0)->6
        return day === 0 ? 6 : day - 1;
    }, [currentMonth]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onDateSelect(newDate);
        onClose(); // Auto close on select
    };

    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    // Generate days array
    const days = [];
    // Empty slots for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    
    // Remaining slots to fill the last row (optional, generally 35 or 42 cells total)
    // For simplicity, just let grid handle it, or fill if needed for consistent height.

    return (
        <div className="absolute top-12 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-gray-900 capitalize">
                    {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentMonth)}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} />;
                    }

                    const isSelected = 
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentMonth.getMonth() &&
                        selectedDate.getFullYear() === currentMonth.getFullYear();

                    const isToday = 
                        new Date().getDate() === day &&
                        new Date().getMonth() === currentMonth.getMonth() &&
                        new Date().getFullYear() === currentMonth.getFullYear();

                    return (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors mx-auto
                                ${isSelected 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                                    : isToday 
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'text-gray-700 hover:bg-gray-100'}
                            `}
                        >
                            {day}
                            {/* Marker dot */}
                            {markedDates && markedDates.some(d => 
                                d.getDate() === day &&
                                d.getMonth() === currentMonth.getMonth() &&
                                d.getFullYear() === currentMonth.getFullYear()
                            ) && (
                                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
