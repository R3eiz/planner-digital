// Local Storage utilities para NOVUS 2026

import { Category, Task, Appointment, UserProfile, ProductivityStats, Goal, Achievement } from './types';
import { getItemsForDateRange } from './recurrence';

const STORAGE_KEYS = {
  CATEGORIES: 'novus_categories',
  TASKS: 'novus_tasks',
  APPOINTMENTS: 'novus_appointments',
  USER_PROFILE: 'novus_user_profile',
  THEME_COLOR: 'novus_theme_color',
  DARK_MODE: 'novus_dark_mode',
  CUSTOM_COLORS: 'novus_custom_colors',
  GOALS: 'novus_goals',
  ACHIEVEMENTS: 'novus_achievements',
};

// Categories
export const getCategories = (): Category[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : getDefaultCategories();
};

export const saveCategories = (categories: Category[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getDefaultCategories = (): Category[] => [
  { id: '1', name: 'Trabalho', color: '#3b82f6' },
  { id: '2', name: 'Pessoal', color: '#10b981' },
  { id: '3', name: 'Saúde', color: '#06b6d4' },
  { id: '4', name: 'Estudos', color: '#8b5cf6' },
];

// Tasks
export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Appointments
export const getAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveAppointments = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

// User Profile
export const getUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return getDefaultUserProfile();
  }
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : getDefaultUserProfile();
};

export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getDefaultUserProfile = (): UserProfile => ({
  name: 'Usuário',
  email: 'usuario@novus2026.com',
  plan: {
    type: 'free',
    startDate: new Date().toISOString(),
  },
  themeColor: '#0ea5e9',
  darkMode: false,
  customColors: [],
});

// Theme Color
export const getThemeColor = (): string => {
  if (typeof window === 'undefined') return '#0ea5e9';
  return localStorage.getItem(STORAGE_KEYS.THEME_COLOR) || '#0ea5e9';
};

export const saveThemeColor = (color: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME_COLOR, color);
};

// Dark Mode
export const getDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const data = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  return data === 'true';
};

export const saveDarkMode = (darkMode: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, darkMode.toString());
};

// Custom Colors
export const getCustomColors = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_COLORS);
  return data ? JSON.parse(data) : [];
};

export const saveCustomColors = (colors: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CUSTOM_COLORS, JSON.stringify(colors));
};

// Goals
export const getGoals = (): Goal[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  return data ? JSON.parse(data) : [];
};

export const saveGoals = (goals: Goal[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

// Achievements
export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveAchievements = (achievements: Achievement[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
};

// Productivity Stats (with recurring items support and ALL categories)
export const calculateProductivityStats = (
  tasks: Task[], 
  appointments: Appointment[], 
  categories: Category[]
): ProductivityStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Expand recurring items for each period
  const dailyTasks = getItemsForDateRange(tasks, today, tomorrow);
  const dailyAppointments = getItemsForDateRange(appointments, today, tomorrow);
  const dailyActivities = [...dailyTasks, ...dailyAppointments];

  const weeklyTasks = getItemsForDateRange(tasks, weekStart, weekEnd);
  const weeklyAppointments = getItemsForDateRange(appointments, weekStart, weekEnd);
  const weeklyActivities = [...weeklyTasks, ...weeklyAppointments];

  const monthlyTasks = getItemsForDateRange(tasks, monthStart, monthEnd);
  const monthlyAppointments = getItemsForDateRange(appointments, monthStart, monthEnd);
  const monthlyActivities = [...monthlyTasks, ...monthlyAppointments];

  // CORREÇÃO: Expandir todas as atividades recorrentes para contabilizar no breakdown
  // Usar um período amplo para capturar todas as instâncias recorrentes
  const farPast = new Date(now.getFullYear() - 1, 0, 1);
  const farFuture = new Date(now.getFullYear() + 1, 11, 31);
  
  const allExpandedTasks = getItemsForDateRange(tasks, farPast, farFuture);
  const allExpandedAppointments = getItemsForDateRange(appointments, farPast, farFuture);
  const allExpandedActivities = [...allExpandedTasks, ...allExpandedAppointments];

  // CORREÇÃO: Incluir TODAS as categorias, mesmo as novas sem atividades
  const categoryBreakdown = categories.map(cat => {
    const categoryActivities = allExpandedActivities.filter(a => a.categoryId === cat.id);
    const completedActivities = categoryActivities.filter(a => a.completed);
    
    return {
      categoryId: cat.id,
      completed: completedActivities.length,
      total: categoryActivities.length,
    };
  });

  return {
    daily: {
      completed: dailyActivities.filter(a => a.completed).length,
      total: dailyActivities.length,
      percentage: dailyActivities.length > 0 
        ? Math.round((dailyActivities.filter(a => a.completed).length / dailyActivities.length) * 100)
        : 0,
    },
    weekly: {
      completed: weeklyActivities.filter(a => a.completed).length,
      total: weeklyActivities.length,
      percentage: weeklyActivities.length > 0
        ? Math.round((weeklyActivities.filter(a => a.completed).length / weeklyActivities.length) * 100)
        : 0,
    },
    monthly: {
      completed: monthlyActivities.filter(a => a.completed).length,
      total: monthlyActivities.length,
      percentage: monthlyActivities.length > 0
        ? Math.round((monthlyActivities.filter(a => a.completed).length / monthlyActivities.length) * 100)
        : 0,
    },
    categoryBreakdown,
  };
};
