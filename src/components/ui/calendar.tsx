"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "~/lib/utils"

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ 
  selected, 
  onSelect, 
  className
}) => {
  const [currentDate, setCurrentDate] = React.useState(() => selected ?? new Date());

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysFromPrevMonth = (date: Date): number[] => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonthDays: number[] = [];
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthDays.push(daysInPrevMonth - i);
    }
    return prevMonthDays;
  };

  const getDaysFromNextMonth = (date: Date, currentMonthDays: number, prevMonthDays: number[]): number[] => {
    const totalSlots = 42; // 6 rows * 7 days
    const nextMonthDays: number[] = [];
    const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays);
    
    for (let i = 1; i <= remainingSlots; i++) {
      nextMonthDays.push(i);
    }
    return nextMonthDays;
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day: number): void => {
    if (onSelect) {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onSelect(selectedDate);
    }
  };

  const daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const daysInMonth = getDaysInMonth(currentDate);
  const prevMonthDays = getDaysFromPrevMonth(currentDate);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const nextMonthDays = getDaysFromNextMonth(currentDate, daysInMonth, prevMonthDays);

  return (
    <div className={cn("w-full max-w-[340px]", className)}>
      <div className="bg-background rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="h-8 w-8 p-0 hover:opacity-50 flex items-center justify-center rounded-md"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold">{formatMonth(currentDate)}</h2>
          <button
            className="h-8 w-8 p-0 hover:opacity-50 flex items-center justify-center rounded-md"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 text-center gap-0">
          {/* Day headers */}
          {daysOfWeek.map((day: string) => (
            <div 
              key={day} 
              className="mb-2 text-xs font-medium text-muted-foreground h-8 flex items-center justify-center"
            >
              {day}
            </div>
          ))}

          {/* Previous month days */}
          {prevMonthDays.map((day: number) => (
            <div key={`prev-${day}`} className="p-0.5">
              <button
                className="h-8 w-8 p-0 text-sm text-muted-foreground/50 hover:bg-muted rounded-md"
                onClick={() => handleSelectDate(day)}
              >
                {day}
              </button>
            </div>
          ))}

          {/* Current month days */}
          {currentMonthDays.map((day: number) => (
            <div key={`current-${day}`} className="p-0.5">
              <button
                className={cn(
                  "h-8 w-8 p-0 text-sm font-normal rounded-md",
                  selected?.getDate() === day && 
                  selected?.getMonth() === currentDate.getMonth() && 
                  selected?.getFullYear() === currentDate.getFullYear() 
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSelectDate(day)}
              >
                {day}
              </button>
            </div>
          ))}

          {/* Next month days */}
          {nextMonthDays.map((day: number) => (
            <div key={`next-${day}`} className="p-0.5">
              <button
                className="h-8 w-8 p-0 text-sm text-muted-foreground/50 hover:bg-muted rounded-md"
                onClick={() => handleSelectDate(day)}
              >
                {day}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Calendar.displayName = "Calendar";

export { Calendar }; 