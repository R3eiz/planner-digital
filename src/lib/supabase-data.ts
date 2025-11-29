import { supabase } from './supabase';
import { Category, Task, Appointment, UserProfile, Goal } from './types';

// Funções para Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function saveCategories(categories: Category[]): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .upsert(categories);

  if (error) {
    console.error('Error saving categories:', error);
  }
}

export async function addCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...category, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error adding category:', error);
    return null;
  }

  return data;
}

export async function updateCategory(category: Category): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      color: category.color,
      icon: category.icon,
      updated_at: new Date().toISOString()
    })
    .eq('id', category.id);

  if (error) {
    console.error('Error updating category:', error);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting category:', error);
  }
}

// Funções para Tasks
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .upsert(tasks);

  if (error) {
    console.error('Error saving tasks:', error);
  }
}

export async function addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error adding task:', error);
    return null;
  }

  return data;
}

export async function updateTask(task: Task): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      title: task.title,
      description: task.description,
      category_id: task.category_id,
      due_date: task.due_date,
      priority: task.priority,
      completed: task.completed,
      recurrence_type: task.recurrence_type,
      recurrence_interval: task.recurrence_interval,
      recurrence_end_date: task.recurrence_end_date,
      recurrence_exceptions: task.recurrence_exceptions,
      recurrence_completions: task.recurrence_completions,
      updated_at: new Date().toISOString()
    })
    .eq('id', task.id);

  if (error) {
    console.error('Error updating task:', error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
  }
}

// Funções para Appointments
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data || [];
}

export async function saveAppointments(appointments: Appointment[]): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .upsert(appointments);

  if (error) {
    console.error('Error saving appointments:', error);
  }
}

export async function addAppointment(appointment: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...appointment, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error adding appointment:', error);
    return null;
  }

  return data;
}

export async function updateAppointment(appointment: Appointment): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({
      title: appointment.title,
      description: appointment.description,
      category_id: appointment.category_id,
      start_date: appointment.start_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      location: appointment.location,
      completed: appointment.completed,
      recurrence_type: appointment.recurrence_type,
      recurrence_interval: appointment.recurrence_interval,
      recurrence_end_date: appointment.recurrence_end_date,
      recurrence_exceptions: appointment.recurrence_exceptions,
      recurrence_completions: appointment.recurrence_completions,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointment.id);

  if (error) {
    console.error('Error updating appointment:', error);
  }
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (error) {
    console.error('Error deleting appointment:', error);
  }
}

// Funções para Goals
export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  return data || [];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .upsert(goals);

  if (error) {
    console.error('Error saving goals:', error);
  }
}

export async function addGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('goals')
    .insert([{ ...goal, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error adding goal:', error);
    return null;
  }

  return data;
}

export async function updateGoal(goal: Goal): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({
      title: goal.title,
      description: goal.description,
      target_date: goal.target_date,
      completed: goal.completed,
      progress: goal.progress,
      updated_at: new Date().toISOString()
    })
    .eq('id', goal.id);

  if (error) {
    console.error('Error updating goal:', error);
  }
}

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting goal:', error);
  }
}

// Funções para UserProfile
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile);

  if (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user profile:', error);
  }
}

// Funções de compatibilidade com localStorage (para transição)
export function getThemeColor(): string {
  return '#0ea5e9'; // valor padrão
}

export function saveThemeColor(color: string): void {
  // Implementar se necessário
}

export function getDarkMode(): boolean {
  return false; // valor padrão
}

export function saveDarkMode(darkMode: boolean): void {
  // Implementar se necessário
}

export function getCustomColors(): string[] {
  return [];
}

export function saveCustomColors(colors: string[]): void {
  // Implementar se necessário
}