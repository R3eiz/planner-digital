'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task, Appointment, Category, RecurrenceConfig } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
  onAddAppointment: (appointment: Appointment) => void;
  categories: Category[];
  selectedDate?: Date;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function TaskDialog({
  open,
  onOpenChange,
  onAddTask,
  onAddAppointment,
  categories,
  selectedDate,
}: TaskDialogProps) {
  const [activeTab, setActiveTab] = useState<'task' | 'appointment'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState<Date>(selectedDate || new Date());
  
  // Recurrence settings
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [monthlyType, setMonthlyType] = useState<'day' | 'position'>('day');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [weekOfMonth, setWeekOfMonth] = useState(1);
  const [interval, setInterval] = useState(1);
  const [endType, setEndType] = useState<'never' | 'date' | 'count'>('never');
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [occurrences, setOccurrences] = useState(10);
  
  // Appointment specific
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    if (title.trim() && categoryId) {
      let recurrence: RecurrenceConfig | undefined = undefined;

      if (hasRecurrence) {
        recurrence = {
          type: recurrenceType,
          interval,
          endType,
          endDate: endDate?.toISOString().split('T')[0],
          occurrences: endType === 'count' ? occurrences : undefined,
          exceptions: [],
        };

        // Add type-specific settings
        if (recurrenceType === 'weekly' && selectedDays.length > 0) {
          recurrence.daysOfWeek = selectedDays;
        }

        if (recurrenceType === 'monthly') {
          recurrence.monthlyType = monthlyType;
          if (monthlyType === 'day') {
            recurrence.dayOfMonth = dayOfMonth;
          } else {
            recurrence.weekOfMonth = weekOfMonth;
          }
        }
      }

      if (activeTab === 'task') {
        const newTask: Task = {
          id: Date.now().toString(),
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId,
          date: date.toISOString(),
          completed: false,
          type: 'task',
          createdAt: new Date().toISOString(),
          recurrence,
          recurringCompletions: [],
        };
        onAddTask(newTask);
      } else {
        const newAppointment: Appointment = {
          id: Date.now().toString(),
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId,
          date: date.toISOString(),
          startTime,
          duration,
          completed: false,
          type: 'appointment',
          createdAt: new Date().toISOString(),
          recurrence,
          recurringCompletions: [],
        };
        onAddAppointment(newAppointment);
      }
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setDate(selectedDate || new Date());
    setHasRecurrence(false);
    setRecurrenceType('daily');
    setSelectedDays([]);
    setMonthlyType('day');
    setDayOfMonth(1);
    setWeekOfMonth(1);
    setInterval(1);
    setEndType('never');
    setEndDate(undefined);
    setOccurrences(10);
    setStartTime('09:00');
    setDuration(60);
    setActiveTab('task');
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const durationOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1h 30min' },
    { value: 120, label: '2 horas' },
    { value: 180, label: '3 horas' },
    { value: 240, label: '4 horas' },
  ];

  const RecurrenceSettings = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="recurrence">Atividade recorrente</Label>
        <Switch
          id="recurrence"
          checked={hasRecurrence}
          onCheckedChange={setHasRecurrence}
        />
      </div>

      {hasRecurrence && (
        <div className="space-y-4 pl-4 border-l-2 border-slate-200">
          {/* Recurrence Type */}
          <div>
            <Label>Tipo de recorrência</Label>
            <Select value={recurrenceType} onValueChange={(value: any) => setRecurrenceType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="custom">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekly: Select days */}
          {recurrenceType === 'weekly' && (
            <div>
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day.value}
                    type="button"
                    size="sm"
                    variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                    onClick={() => toggleDay(day.value)}
                    className="w-12"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Day or Position */}
          {recurrenceType === 'monthly' && (
            <div className="space-y-3">
              <div>
                <Label>Tipo de repetição mensal</Label>
                <Select value={monthlyType} onValueChange={(value: any) => setMonthlyType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia específico do mês</SelectItem>
                    <SelectItem value="position">Posição no mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {monthlyType === 'day' && (
                <div>
                  <Label>Dia do mês</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
              )}

              {monthlyType === 'position' && (
                <div>
                  <Label>Semana do mês</Label>
                  <Select value={weekOfMonth.toString()} onValueChange={(v) => setWeekOfMonth(parseInt(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Primeira</SelectItem>
                      <SelectItem value="2">Segunda</SelectItem>
                      <SelectItem value="3">Terceira</SelectItem>
                      <SelectItem value="4">Quarta</SelectItem>
                      <SelectItem value="5">Última</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Custom: Interval */}
          {recurrenceType === 'custom' && (
            <div>
              <Label>Repetir a cada (dias)</Label>
              <Input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
          )}

          {/* Interval for other types */}
          {recurrenceType !== 'custom' && recurrenceType !== 'daily' && (
            <div>
              <Label>
                Intervalo ({recurrenceType === 'weekly' ? 'semanas' : recurrenceType === 'monthly' ? 'meses' : 'anos'})
              </Label>
              <Input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="mt-1"
                placeholder="1"
              />
            </div>
          )}

          {/* End conditions */}
          <div className="space-y-3">
            <Label>Termina</Label>
            <Select value={endType} onValueChange={(value: any) => setEndType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Nunca</SelectItem>
                <SelectItem value="date">Em uma data</SelectItem>
                <SelectItem value="count">Após X ocorrências</SelectItem>
              </SelectContent>
            </Select>

            {endType === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            {endType === 'count' && (
              <div>
                <Label>Número de ocorrências</Label>
                <Input
                  type="number"
                  min="1"
                  value={occurrences}
                  onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'task' | 'appointment')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="task">Tarefa</TabsTrigger>
            <TabsTrigger value="appointment">Compromisso</TabsTrigger>
          </TabsList>

          <TabsContent value="task" className="space-y-4 mt-4">
            <p className="text-sm text-slate-600">
              Tarefas são atividades que você precisa fazer durante o dia, sem horário específico.
            </p>
            
            {/* Title */}
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da tarefa"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes da tarefa (opcional)"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
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
            </div>

            {/* Date */}
            <div>
              <Label>Data de início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Recurrence */}
            <RecurrenceSettings />
          </TabsContent>

          <TabsContent value="appointment" className="space-y-4 mt-4">
            <p className="text-sm text-slate-600">
              Compromissos têm horário de início e duração definidos.
            </p>
            
            {/* Title */}
            <div>
              <Label htmlFor="appt-title">Título *</Label>
              <Input
                id="appt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do compromisso"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="appt-description">Descrição</Label>
              <Textarea
                id="appt-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do compromisso (opcional)"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="appt-category">Categoria *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
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
            </div>

            {/* Date */}
            <div>
              <Label>Data de início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="start-time">Horário de início *</Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duração *</Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recurrence */}
            <RecurrenceSettings />
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !categoryId}
          className="w-full mt-4"
        >
          Criar {activeTab === 'task' ? 'Tarefa' : 'Compromisso'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
