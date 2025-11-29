// Utility functions for handling recurring tasks and appointments
// Following Google Calendar recurrence patterns

import { Task, Appointment, RecurrenceConfig, RecurringCompletion } from './types';

/**
 * Generates recurring instances following Google Calendar patterns
 */
export function generateRecurringInstances<T extends Task | Appointment>(
  item: T,
  startDate: Date,
  endDate: Date
): T[] {
  if (!item.recurrence) {
    return [item];
  }

  const instances: T[] = [];
  const originalDate = new Date(item.date);
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const { type, interval = 1, endType, endDate: recEndDate, occurrences, exceptions = [] } = item.recurrence;

  // Check if recurrence has ended
  if (endType === 'date' && recEndDate) {
    const recEnd = new Date(recEndDate);
    if (currentDate > recEnd) {
      return [];
    }
  }

  let date = new Date(originalDate);
  let count = 0;
  const maxOccurrences = endType === 'count' && occurrences ? occurrences : 1000;

  while (date <= end && count < maxOccurrences) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip if date is in exceptions
    if (!exceptions.includes(dateStr) && date >= currentDate) {
      const completion = item.recurringCompletions?.find(c => c.instanceDate === dateStr);
      
      instances.push({
        ...item,
        id: `${item.id}-${dateStr}`,
        date: dateStr,
        completed: completion?.completed || false,
      } as T);
    }

    count++;

    // Move to next occurrence based on type
    if (type === 'daily') {
      date.setDate(date.getDate() + interval);
    } else if (type === 'weekly') {
      if (item.recurrence.daysOfWeek && item.recurrence.daysOfWeek.length > 0) {
        // Weekly with specific days
        date = getNextWeekdayOccurrence(date, item.recurrence.daysOfWeek, interval);
      } else {
        // Weekly on same day
        date.setDate(date.getDate() + (7 * interval));
      }
    } else if (type === 'monthly') {
      if (item.recurrence.monthlyType === 'day' && item.recurrence.dayOfMonth) {
        // Monthly on specific day (e.g., every 10th)
        date.setMonth(date.getMonth() + interval);
        date.setDate(item.recurrence.dayOfMonth);
      } else if (item.recurrence.monthlyType === 'position' && item.recurrence.weekOfMonth !== undefined) {
        // Monthly on position (e.g., 2nd Tuesday)
        date = getNextMonthlyPositionOccurrence(
          date,
          item.recurrence.weekOfMonth,
          date.getDay(),
          interval
        );
      } else {
        // Default: same day of month
        date.setMonth(date.getMonth() + interval);
      }
    } else if (type === 'yearly') {
      date.setFullYear(date.getFullYear() + interval);
    } else if (type === 'custom') {
      // Custom handled by interval in daily/weekly/monthly
      date.setDate(date.getDate() + interval);
    }

    // Check end conditions
    if (endType === 'date' && recEndDate) {
      const recEnd = new Date(recEndDate);
      if (date > recEnd) break;
    }
  }

  return instances;
}

/**
 * Gets next occurrence for weekly recurrence with specific days
 */
function getNextWeekdayOccurrence(currentDate: Date, daysOfWeek: number[], weekInterval: number): Date {
  const date = new Date(currentDate);
  const currentDay = date.getDay();
  
  // Sort days and find next day in the same week
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const nextDayInWeek = sortedDays.find(day => day > currentDay);
  
  if (nextDayInWeek !== undefined) {
    // Move to next day in same week
    date.setDate(date.getDate() + (nextDayInWeek - currentDay));
  } else {
    // Move to first day of next week cycle
    const daysUntilNextWeek = (7 - currentDay) + sortedDays[0] + (7 * (weekInterval - 1));
    date.setDate(date.getDate() + daysUntilNextWeek);
  }
  
  return date;
}

/**
 * Gets next occurrence for monthly position (e.g., 2nd Tuesday)
 */
function getNextMonthlyPositionOccurrence(
  currentDate: Date,
  weekOfMonth: number,
  dayOfWeek: number,
  monthInterval: number
): Date {
  const date = new Date(currentDate);
  date.setMonth(date.getMonth() + monthInterval);
  date.setDate(1);
  
  // Find first occurrence of dayOfWeek in the month
  while (date.getDay() !== dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }
  
  // Move to the correct week (0-indexed, so weekOfMonth - 1)
  date.setDate(date.getDate() + (7 * (weekOfMonth - 1)));
  
  return date;
}

/**
 * Checks if an instance is completed
 */
export function isInstanceCompleted(item: Task | Appointment, instanceDate: string): boolean {
  if (!item.recurrence) {
    return item.completed;
  }
  
  const completion = item.recurringCompletions?.find(c => c.instanceDate === instanceDate);
  return completion?.completed || false;
}

/**
 * Toggles completion status for a specific instance
 */
export function toggleInstanceCompletion(
  item: Task | Appointment,
  instanceDate: string
): Task | Appointment {
  if (!item.recurrence) {
    return { ...item, completed: !item.completed };
  }

  const completions = item.recurringCompletions || [];
  const existingIndex = completions.findIndex(c => c.instanceDate === instanceDate);

  let newCompletions: RecurringCompletion[];
  
  if (existingIndex >= 0) {
    // Toggle existing completion
    newCompletions = [...completions];
    newCompletions[existingIndex] = {
      ...newCompletions[existingIndex],
      completed: !newCompletions[existingIndex].completed,
      completedAt: !newCompletions[existingIndex].completed ? new Date().toISOString() : undefined,
    };
  } else {
    // Add new completion
    newCompletions = [
      ...completions,
      {
        instanceDate,
        completed: true,
        completedAt: new Date().toISOString(),
      },
    ];
  }

  return {
    ...item,
    recurringCompletions: newCompletions,
  };
}

/**
 * Adds an exception date to skip a specific occurrence
 */
export function addRecurrenceException(
  item: Task | Appointment,
  exceptionDate: string
): Task | Appointment {
  if (!item.recurrence) {
    return item;
  }

  const exceptions = item.recurrence.exceptions || [];
  
  return {
    ...item,
    recurrence: {
      ...item.recurrence,
      exceptions: [...exceptions, exceptionDate],
    },
  };
}

/**
 * Expands all recurring items for a date range
 */
export function expandRecurringItems<T extends Task | Appointment>(
  items: T[],
  startDate: Date,
  endDate: Date
): T[] {
  const expanded: T[] = [];

  for (const item of items) {
    const instances = generateRecurringInstances(item, startDate, endDate);
    expanded.push(...instances);
  }

  return expanded;
}

/**
 * Gets all items for a specific date
 */
export function getItemsForDate<T extends Task | Appointment>(
  items: T[],
  date: Date
): T[] {
  const dateStr = date.toISOString().split('T')[0];
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const expanded = expandRecurringItems(items, date, nextDay);
  
  return expanded.filter(item => item.date.startsWith(dateStr));
}

/**
 * Gets all items for a month
 */
export function getItemsForMonth<T extends Task | Appointment>(
  items: T[],
  year: number,
  month: number
): T[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return expandRecurringItems(items, startDate, endDate);
}

/**
 * Gets all items for a week
 */
export function getItemsForWeek<T extends Task | Appointment>(
  items: T[],
  date: Date
): T[] {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return expandRecurringItems(items, weekStart, weekEnd);
}

/**
 * Gets all items for a date range
 */
export function getItemsForDateRange<T extends Task | Appointment>(
  items: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return expandRecurringItems(items, startDate, endDate);
}

/**
 * Gets the start of the week (Sunday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Gets the original item ID from an instance ID
 */
export function getOriginalItemId(instanceId: string): string {
  return instanceId.split('-')[0];
}

/**
 * Gets the instance date from an instance ID
 */
export function getInstanceDate(instanceId: string): string | null {
  const parts = instanceId.split('-');
  if (parts.length > 1) {
    return parts.slice(1).join('-');
  }
  return null;
}

/**
 * Checks if an ID is for a recurring instance
 */
export function isRecurringInstance(id: string): boolean {
  return id.includes('-') && id.split('-').length > 1;
}
