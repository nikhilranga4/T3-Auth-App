"use client"

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className }) => {
  const [currentDate, setCurrentDate] = React.useState(() => selected || new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysFromPrevMonth = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonthDays: number[] = [];
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthDays.push(daysInPrevMonth - i);
    }
    return prevMonthDays;
  };

  const getDaysFromNextMonth = (date: Date, currentMonthDays: number, prevMonthDays: number[]) => {
    const totalSlots = 42; // 6 rows * 7 days
    const nextMonthDays: number[] = [];
    const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays);
    
    for (let i = 1; i <= remainingSlots; i++) {
      nextMonthDays.push(i);
    }
    return nextMonthDays;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    if (onSelect) {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onSelect(selectedDate);
    }
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const daysInMonth = getDaysInMonth(currentDate);
  const prevMonthDays = getDaysFromPrevMonth(currentDate);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const nextMonthDays = getDaysFromNextMonth(currentDate, daysInMonth, prevMonthDays);

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-background rounded-lg p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 hover:opacity-50"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">{formatMonth(currentDate)}</h2>
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 hover:opacity-50"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 mt-1">
          {/* Day headers */}
          {daysOfWeek.map(day => (
            <div key={day} className="text-[11px] font-normal text-muted-foreground text-center tracking-widest pb-2">
              {day}
            </div>
          ))}

          {/* Previous month days */}
          {prevMonthDays.map(day => (
            <Button
              key={`prev-${day}`}
              variant="ghost"
              className="h-8 w-8 p-0 text-sm text-muted-foreground/50"
              onClick={() => handleSelectDate(day)}
            >
              {day}
            </Button>
          ))}

          {/* Current month days */}
          {currentMonthDays.map(day => (
            <Button
              key={`current-${day}`}
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0 text-sm font-normal",
                selected?.getDate() === day && 
                selected?.getMonth() === currentDate.getMonth() && 
                selected?.getFullYear() === currentDate.getFullYear() 
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => handleSelectDate(day)}
            >
              {day}
            </Button>
          ))}

          {/* Next month days */}
          {nextMonthDays.map(day => (
            <Button
              key={`next-${day}`}
              variant="ghost"
              className="h-8 w-8 p-0 text-sm text-muted-foreground/50"
              onClick={() => handleSelectDate(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { Calendar };