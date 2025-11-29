'use client';

import { useState, useMemo } from 'react';
import { Check, Trash2, Plus, Filter, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Task, Appointment, Category } from '@/lib/types';
import { getItemsForDateRange, isRecurringInstance } from '@/lib/recurrence';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TasksViewProps {
  tasks: Task[];
  appointments: Appointment[];
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onToggleAppointment: (appointmentId: string) => void;
  onDeleteTask: (taskId: string, deleteAll?: boolean) => void;
  onDeleteAppointment: (appointmentId: string, deleteAll?: boolean) => void;
  onAddCategory: () => void;
  themeColor: string;
}

export default function TasksView({
  tasks = [],
  appointments = [],
  categories = [],
  onToggleTask,
  onToggleAppointment,
  onDeleteTask,
  onDeleteAppointment,
  onAddCategory,
  themeColor,
}: TasksViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewType, setViewType] = useState<'all' | 'tasks' | 'appointments'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    type: 'task' | 'appointment';
    isRecurring: boolean;
  }>({ open: false, id: '', type: 'task', isRecurring: false });

  // Calculate date range for expanding recurring items
  const { startDate, endDate, today, todayStr } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let start = new Date(today);
    let end = new Date(today);

    if (dateRange === 'week') {
      start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      end.setDate(start.getDate() + 6); // End of week (Saturday)
    } else if (dateRange === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of month
    } else {
      // Show all - expand for next 3 months
      start.setMonth(today.getMonth() - 1);
      end.setMonth(today.getMonth() + 3);
    }

    return { startDate: start, endDate: end, today, todayStr };
  }, [dateRange]);

  // Expand recurring items
  const expandedTasks = useMemo(() => 
    getItemsForDateRange(tasks, startDate, endDate),
    [tasks, startDate, endDate]
  );

  const expandedAppointments = useMemo(() => 
    getItemsForDateRange(appointments, startDate, endDate),
    [appointments, startDate, endDate]
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#94a3b8';
  };

  const filteredTasks = (expandedTasks || []).filter(task => {
    const categoryMatch = filterCategory === 'all' || task.categoryId === filterCategory;
    const statusMatch = filterStatus === 'all' || 
                       (filterStatus === 'completed' && task.completed) ||
                       (filterStatus === 'pending' && !task.completed);
    return categoryMatch && statusMatch;
  });

  const filteredAppointments = (expandedAppointments || []).filter(appt => {
    const categoryMatch = filterCategory === 'all' || appt.categoryId === filterCategory;
    const statusMatch = filterStatus === 'all' || 
                       (filterStatus === 'completed' && appt.completed) ||
                       (filterStatus === 'pending' && !appt.completed);
    return categoryMatch && statusMatch;
  });

  // Separate today's activities from others
  const todayTasks = filteredTasks.filter(task => task.date.startsWith(todayStr));
  const todayAppointments = filteredAppointments.filter(appt => appt.date.startsWith(todayStr));
  const otherTasks = filteredTasks.filter(task => !task.date.startsWith(todayStr));
  const otherAppointments = filteredAppointments.filter(appt => !appt.date.startsWith(todayStr));

  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return 0;
  });

  const sortedTodayAppointments = [...todayAppointments].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const sortedOtherTasks = [...otherTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const sortedOtherAppointments = [...otherAppointments].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const dateA = new Date(a.date + 'T' + a.startTime).getTime();
    const dateB = new Date(b.date + 'T' + b.startTime).getTime();
    return dateA - dateB;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getRecurrenceText = (item: Task | Appointment) => {
    if (!item.recurrence) return null;
    
    if (item.recurrence.type === 'daily') {
      return 'Diário';
    } else if (item.recurrence.type === 'weekly') {
      return 'Semanal';
    } else if (item.recurrence.type === 'custom' && item.recurrence.timesPerWeek) {
      return `${item.recurrence.timesPerWeek}x por semana`;
    }
    return null;
  };

  const handleDeleteClick = (id: string, type: 'task' | 'appointment') => {
    const isRecurring = isRecurringInstance(id);
    setDeleteDialog({ open: true, id, type, isRecurring });
  };

  const handleDeleteConfirm = (deleteAll: boolean) => {
    if (deleteDialog.type === 'task') {
      onDeleteTask(deleteDialog.id, deleteAll);
    } else {
      onDeleteAppointment(deleteDialog.id, deleteAll);
    }
    setDeleteDialog({ open: false, id: '', type: 'task', isRecurring: false });
  };

  const showTasks = viewType === 'all' || viewType === 'tasks';
  const showAppointments = viewType === 'all' || viewType === 'appointments';

  const ActivityCard = ({ 
    item, 
    type, 
    onToggle, 
    onDelete 
  }: { 
    item: Task | Appointment; 
    type: 'task' | 'appointment';
    onToggle: (id: string) => void;
    onDelete: (id: string, type: 'task' | 'appointment') => void;
  }) => (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
        item.completed 
          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' 
          : type === 'appointment'
            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 hover:border-blue-300 hover:shadow-md'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1"
          style={item.completed ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-medium ${
                item.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'
              }`}>
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(item.id, type)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge
              variant="secondary"
              className="rounded-full text-xs"
              style={{ backgroundColor: `${getCategoryColor(item.categoryId)}20`, color: getCategoryColor(item.categoryId) }}
            >
              {getCategoryName(item.categoryId)}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(item.date)}
            </span>
            {type === 'appointment' && (
              <Badge variant="outline" className="rounded-full text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(item as Appointment).startTime} • {formatDuration((item as Appointment).duration)}
              </Badge>
            )}
            {getRecurrenceText(item) && (
              <Badge variant="outline" className="rounded-full text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                🔄 {getRecurrenceText(item)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filtros</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={viewType} onValueChange={(v: any) => setViewType(v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tudo</SelectItem>
                <SelectItem value="tasks">Apenas Tarefas</SelectItem>
                <SelectItem value="appointments">Apenas Compromissos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Categories Management */}
      <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categorias</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddCategory}
            className="rounded-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Nova
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category.id}
              variant="secondary"
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* TODAY'S ACTIVITIES - HIGHLIGHTED */}
      {(todayTasks.length > 0 || todayAppointments.length > 0) && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 shadow-xl" style={{ borderColor: `${themeColor}60` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColor}20` }}>
              <CalendarIcon className="w-6 h-6" style={{ color: themeColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hoje</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Today's Appointments */}
          {showAppointments && sortedTodayAppointments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Compromissos de Hoje ({sortedTodayAppointments.length})
              </h3>
              <div className="space-y-3">
                {sortedTodayAppointments.map(appt => (
                  <ActivityCard
                    key={appt.id}
                    item={appt}
                    type="appointment"
                    onToggle={onToggleAppointment}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          {showTasks && sortedTodayTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Tarefas de Hoje ({sortedTodayTasks.length})
              </h3>
              <div className="space-y-3">
                {sortedTodayTasks.map(task => (
                  <ActivityCard
                    key={task.id}
                    item={task}
                    type="task"
                    onToggle={onToggleTask}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* OTHER DAYS' APPOINTMENTS */}
      {showAppointments && sortedOtherAppointments.length > 0 && (
        <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Outros Compromissos ({sortedOtherAppointments.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {sortedOtherAppointments.map(appt => (
              <ActivityCard
                key={appt.id}
                item={appt}
                type="appointment"
                onToggle={onToggleAppointment}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </Card>
      )}

      {/* OTHER DAYS' TASKS */}
      {showTasks && sortedOtherTasks.length > 0 && (
        <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Outras Tarefas ({sortedOtherTasks.length})
          </h3>
          
          <div className="space-y-3">
            {sortedOtherTasks.map(task => (
              <ActivityCard
                key={task.id}
                item={task}
                type="task"
                onToggle={onToggleTask}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {todayTasks.length === 0 && todayAppointments.length === 0 && 
       otherTasks.length === 0 && otherAppointments.length === 0 && (
        <Card className="p-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <div className="text-center">
            <CalendarIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">Nenhuma atividade encontrada</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              Ajuste os filtros ou crie novas atividades
            </p>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.isRecurring ? 'Excluir atividade recorrente' : 'Excluir atividade'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isRecurring ? (
                <>
                  Esta é uma atividade recorrente. Você deseja excluir apenas esta ocorrência ou todas as repetições?
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {deleteDialog.isRecurring ? (
              <>
                <AlertDialogAction
                  onClick={() => handleDeleteConfirm(false)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Apenas esta
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={() => handleDeleteConfirm(true)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Todas
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction
                onClick={() => handleDeleteConfirm(false)}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
