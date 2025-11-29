'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Task, Appointment, Category } from '@/lib/types';
import { Calendar, Clock, CheckSquare, Trash2 } from 'lucide-react';

interface DayViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  tasks: Task[];
  appointments: Appointment[];
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onToggleAppointment: (appointmentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  themeColor: string;
}

export default function DayViewDialog({
  open,
  onOpenChange,
  selectedDate,
  tasks,
  appointments,
  categories,
  onToggleTask,
  onToggleAppointment,
  onDeleteTask,
  onDeleteAppointment,
  themeColor,
}: DayViewDialogProps) {
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const dayTasks = tasks.filter(task => task.date.startsWith(dateStr));
  const dayAppointments = appointments.filter(appt => appt.date.startsWith(dateStr));

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#94a3b8';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const sortedAppointments = [...dayAppointments].sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const totalActivities = dayTasks.length + dayAppointments.length;
  const completedActivities = dayTasks.filter(t => t.completed).length + 
                              dayAppointments.filter(a => a.completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5" style={{ color: themeColor }} />
            {formatDate(selectedDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Summary */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2" style={{ borderColor: `${themeColor}40` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de Atividades</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalActivities}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Concluídas</p>
                <p className="text-2xl font-bold" style={{ color: themeColor }}>
                  {completedActivities}/{totalActivities}
                </p>
              </div>
            </div>
          </Card>

          {/* Appointments */}
          {sortedAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Compromissos ({sortedAppointments.length})
              </h3>
              <div className="space-y-2">
                {sortedAppointments.map(appt => (
                  <Card
                    key={appt.id}
                    className={`p-3 transition-all duration-200 ${
                      appt.completed 
                        ? 'bg-slate-50 dark:bg-slate-800/50' 
                        : 'bg-white dark:bg-slate-800 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={appt.completed}
                        onCheckedChange={() => onToggleAppointment(appt.id)}
                        className="mt-1"
                        style={appt.completed ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              appt.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'
                            }`}>
                              {appt.title}
                            </h4>
                            {appt.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{appt.description}</p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDeleteAppointment(appt.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="rounded-full text-xs"
                            style={{ 
                              backgroundColor: `${getCategoryColor(appt.categoryId)}20`, 
                              color: getCategoryColor(appt.categoryId) 
                            }}
                          >
                            {getCategoryName(appt.categoryId)}
                          </Badge>
                          <Badge variant="outline" className="rounded-full text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appt.startTime} • {formatDuration(appt.duration)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {dayTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-green-600" />
                Tarefas ({dayTasks.length})
              </h3>
              <div className="space-y-2">
                {dayTasks.map(task => (
                  <Card
                    key={task.id}
                    className={`p-3 transition-all duration-200 ${
                      task.completed 
                        ? 'bg-slate-50 dark:bg-slate-800/50' 
                        : 'bg-white dark:bg-slate-800 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="mt-1"
                        style={task.completed ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'
                            }`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="rounded-full text-xs"
                            style={{ 
                              backgroundColor: `${getCategoryColor(task.categoryId)}20`, 
                              color: getCategoryColor(task.categoryId) 
                            }}
                          >
                            {getCategoryName(task.categoryId)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalActivities === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">Nenhuma atividade neste dia</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                Clique em "Nova Atividade" para adicionar
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
