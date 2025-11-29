// Types para NOVUS 2026 com Supabase

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurrenceConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // Every X days/weeks/months/years
  daysOfWeek?: number[]; // For weekly: 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // For monthly: 1-31
  monthlyType?: 'day' | 'position'; // Day of month or position (first Monday, etc.)
  weekOfMonth?: number; // For position-based monthly: 1-5
  endType: 'never' | 'date' | 'count';
  endDate?: string; // ISO date string
  occurrences?: number; // For count-based end
  exceptions?: string[]; // ISO date strings of skipped occurrences
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category_id?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  recurrence_type?: string;
  recurrence_interval?: number;
  recurrence_end_date?: string;
  recurrence_exceptions: string[];
  recurrence_completions: string[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category_id?: string;
  start_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  completed: boolean;
  recurrence_type?: string;
  recurrence_interval?: number;
  recurrence_end_date?: string;
  recurrence_exceptions: string[];
  recurrence_completions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan_type: 'free' | 'monthly' | 'lifetime';
  plan_start_date?: string;
  plan_expiry_date?: string;
  theme_color: string;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0-100
}

export interface ProductivityStats {
  daily: {
    completed: number;
    total: number;
    percentage: number;
  };
  weekly: {
    completed: number;
    total: number;
    percentage: number;
  };
  monthly: {
    completed: number;
    total: number;
    percentage: number;
  };
  categoryBreakdown: {
    categoryId: string;
    completed: number;
    total: number;
  }[];
}