'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Task, Appointment, Category } from '@/lib/types';
import { getItemsForMonth } from '@/lib/recurrence';
import DayViewDialog from './DayViewDialog';

interface CalendarViewProps {
  tasks: Task[];
  appointments: Appointment[];
  categories: Category[];
  onTaskClick?: (task: Task) => void;
  onDateSelect: (date: Date) => void;
  onToggleTask: (taskId: string) => void;
  onToggleAppointment: (appointmentId: string) => void;
  onDeleteTask: (taskId: string, deleteAll?: boolean) => void;
  onDeleteAppointment: (appointmentId: string, deleteAll?: boolean) => void;
  themeColor: string;
}

export default function CalendarView({ 
  tasks, 
  appointments, 
  categories, 
  onTaskClick, 
  onDateSelect,
  onToggleTask,
  onToggleAppointment,
  onDeleteTask,
  onDeleteAppointment,
  themeColor 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Get all tasks and appointments for the current month (including recurring ones)
  const expandedTasks = getItemsForMonth(tasks, currentDate.getFullYear(), currentDate.getMonth());
  const expandedAppointments = getItemsForMonth(appointments, currentDate.getFullYear(), currentDate.getMonth());
  const allItems = [...expandedTasks, ...expandedAppointments];

  const getItemsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return allItems.filter(item => item.date.startsWith(dateStr));
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#94a3b8';
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDayDate(selectedDate);
    onDateSelect(selectedDate);
    setShowDayDialog(true);
  };

  return (
    <>
      <Card className="p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day names */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayItems = getItemsForDate(day);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square p-1 sm:p-2 rounded-lg border transition-all duration-200 hover:shadow-md ${ 
                  isTodayDate 
                    ? 'border-2 shadow-lg' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                style={isTodayDate ? { borderColor: themeColor } : {}}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-xs sm:text-sm font-semibold ${
                    isTodayDate ? 'text-white rounded-full px-1 sm:px-2 py-0.5' : 'text-slate-700 dark:text-slate-300'
                  }`}
                  style={isTodayDate ? { backgroundColor: themeColor } : {}}
                  >
                    {day}
                  </span>
                  <div className="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
                    {dayItems.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        className="w-full h-1 sm:h-1.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                        title={item.title}
                      />
                    ))}
                    {dayItems.length > 3 && (
                      <span className="text-[8px] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
                        +{dayItems.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Day View Dialog */}
      <DayViewDialog
        open={showDayDialog}
        onOpenChange={setShowDayDialog}
        selectedDate={selectedDayDate}
        tasks={expandedTasks}
        appointments={expandedAppointments}
        categories={categories}
        onToggleTask={onToggleTask}
        onToggleAppointment={onToggleAppointment}
        onDeleteTask={onDeleteTask}
        onDeleteAppointment={onDeleteAppointment}
        themeColor={themeColor}
      />
    </>
  );
}
