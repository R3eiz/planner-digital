'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, BarChart3, User, Plus, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CalendarView from '@/components/novus/CalendarView';
import TasksView from '@/components/novus/TasksView';
import DashboardView from '@/components/novus/DashboardView';
import ProfileView from '@/components/novus/ProfileView';
import GoalsView from '@/components/novus/GoalsView';
import CategoryDialog from '@/components/novus/CategoryDialog';
import TaskDialog from '@/components/novus/TaskDialog';
import { Category, Task, Appointment, UserProfile, Goal } from '@/lib/types';
import {
  getCategories,
  getTasks,
  getAppointments,
  getUserProfile,
  getGoals,
  addCategory,
  updateCategory,
  deleteCategory,
  addTask,
  updateTask,
  deleteTask,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  addGoal,
  updateGoal,
  deleteGoal,
  updateUserProfile
} from '@/lib/supabase-data';
import {
  toggleInstanceCompletion,
  addRecurrenceException,
  getOriginalItemId,
  getInstanceDate,
  isRecurringInstance
} from '@/lib/recurrence';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [themeColor, setThemeColor] = useState('#0ea5e9');
  const [darkMode, setDarkMode] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, tasksData, appointmentsData, goalsData, profileData] = await Promise.all([
        getCategories(),
        getTasks(),
        getAppointments(),
        getGoals(),
        getUserProfile()
      ]);

      setCategories(categoriesData);
      setTasks(tasksData);
      setAppointments(appointmentsData);
      setGoals(goalsData);
      setUserProfile(profileData);

      if (profileData) {
        setThemeColor(profileData.theme_color);
        setDarkMode(profileData.dark_mode);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newCategory = await addCategory(category);
    if (newCategory) {
      setCategories([...categories, newCategory]);
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    await updateCategory(updatedCategory);
    setCategories(categories.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId);
    setCategories(categories.filter(cat => cat.id !== categoryId));
    // Also delete related tasks and appointments
    const relatedTasks = tasks.filter(task => task.category_id === categoryId);
    const relatedAppointments = appointments.filter(appt => appt.category_id === categoryId);

    for (const task of relatedTasks) {
      await deleteTask(task.id);
    }
    for (const appointment of relatedAppointments) {
      await deleteAppointment(appointment.id);
    }

    setTasks(tasks.filter(task => task.category_id !== categoryId));
    setAppointments(appointments.filter(appt => appt.category_id !== categoryId));
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newTask = await addTask(task);
    if (newTask) {
      setTasks([...tasks, newTask]);
    }
  };

  const handleAddAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newAppointment = await addAppointment(appointment);
    if (newAppointment) {
      setAppointments([...appointments, newAppointment]);
    }
  };

  const handleDeleteTask = async (taskId: string, deleteAll: boolean = false) => {
    if (isRecurringInstance(taskId)) {
      const originalId = getOriginalItemId(taskId);
      const instanceDate = getInstanceDate(taskId);

      if (deleteAll) {
        // Delete entire recurring series
        await deleteTask(originalId);
        setTasks(tasks.filter(task => task.id !== originalId));
      } else if (instanceDate) {
        // Delete only this instance by adding exception
        const originalTask = tasks.find(task => task.id === originalId);
        if (originalTask) {
          const updatedTask = addRecurrenceException(originalTask, instanceDate) as Task;
          await updateTask(updatedTask);
          setTasks(tasks.map(task => {
            if (task.id === originalId) {
              return updatedTask;
            }
            return task;
          }));
        }
      }
    } else {
      // Delete single task
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleDeleteAppointment = async (appointmentId: string, deleteAll: boolean = false) => {
    if (isRecurringInstance(appointmentId)) {
      const originalId = getOriginalItemId(appointmentId);
      const instanceDate = getInstanceDate(appointmentId);

      if (deleteAll) {
        // Delete entire recurring series
        await deleteAppointment(originalId);
        setAppointments(appointments.filter(appt => appt.id !== originalId));
      } else if (instanceDate) {
        // Delete only this instance by adding exception
        const originalAppointment = appointments.find(appt => appt.id === originalId);
        if (originalAppointment) {
          const updatedAppointment = addRecurrenceException(originalAppointment, instanceDate) as Appointment;
          await updateAppointment(updatedAppointment);
          setAppointments(appointments.map(appt => {
            if (appt.id === originalId) {
              return updatedAppointment;
            }
            return appt;
          }));
        }
      }
    } else {
      // Delete single appointment
      await deleteAppointment(appointmentId);
      setAppointments(appointments.filter(appt => appt.id !== appointmentId));
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (isRecurringInstance(taskId)) {
      const originalId = getOriginalItemId(taskId);
      const instanceDate = getInstanceDate(taskId);

      if (instanceDate) {
        const originalTask = tasks.find(task => task.id === originalId);
        if (originalTask) {
          const updatedTask = toggleInstanceCompletion(originalTask, instanceDate) as Task;
          await updateTask(updatedTask);
          setTasks(tasks.map(task => {
            if (task.id === originalId) {
              return updatedTask;
            }
            return task;
          }));
        }
      }
    } else {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, completed: !task.completed };
        await updateTask(updatedTask);
        setTasks(tasks.map(t =>
          t.id === taskId ? updatedTask : t
        ));
      }
    }
  };

  const handleToggleAppointment = async (appointmentId: string) => {
    if (isRecurringInstance(appointmentId)) {
      const originalId = getOriginalItemId(appointmentId);
      const instanceDate = getInstanceDate(appointmentId);

      if (instanceDate) {
        const originalAppointment = appointments.find(appt => appt.id === originalId);
        if (originalAppointment) {
          const updatedAppointment = toggleInstanceCompletion(originalAppointment, instanceDate) as Appointment;
          await updateAppointment(updatedAppointment);
          setAppointments(appointments.map(appt => {
            if (appt.id === originalId) {
              return updatedAppointment;
            }
            return appt;
          }));
        }
      }
    } else {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        const updatedAppointment = { ...appointment, completed: !appointment.completed };
        await updateAppointment(updatedAppointment);
        setAppointments(appointments.map(a =>
          a.id === appointmentId ? updatedAppointment : a
        ));
      }
    }
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    await updateUserProfile({
      name: profile.name,
      email: profile.email,
      plan_type: profile.plan_type,
      plan_start_date: profile.plan_start_date,
      plan_expiry_date: profile.plan_expiry_date,
      theme_color: profile.theme_color,
      dark_mode: profile.dark_mode
    });
    setUserProfile(profile);
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newGoal = await addGoal(goal);
    if (newGoal) {
      setGoals([...goals, newGoal]);
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    await updateGoal(updatedGoal);
    setGoals(goals.map(g =>
      g.id === updatedGoal.id ? updatedGoal : g
    ));
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const handleDarkModeChange = async (newDarkMode: boolean) => {
    setDarkMode(newDarkMode);
    if (userProfile) {
      await updateUserProfile({ dark_mode: newDarkMode });
    }
  };

  const handleThemeColorChange = async (newColor: string) => {
    setThemeColor(newColor);
    if (userProfile) {
      await updateUserProfile({ theme_color: newColor });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando NOVUS 2026...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider will redirect
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-colors duration-300 ${
        darkMode
          ? 'bg-slate-800/80 border-slate-700'
          : 'bg-white/80 border-slate-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300"
                style={{ backgroundColor: themeColor }}
              >
                N
              </div>
              <div>
                <h1
                  className={`text-3xl transition-colors duration-300 ${
                    darkMode
                      ? 'bg-gradient-to-r from-slate-200 via-blue-400 to-cyan-400'
                      : 'bg-gradient-to-r from-slate-800 via-blue-600 to-cyan-600'
                  } bg-clip-text text-transparent`}
                  style={{ fontFamily: "var(--font-pacifico), var(--font-dancing-script), var(--font-great-vibes), cursive" }}
                >
                  NOVUS 2026
                </h1>
                <p className={`text-xs tracking-wide transition-colors duration-300 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Seu planner digital
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowTaskDialog(true)}
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: themeColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Atividade
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-5 mb-6 backdrop-blur-sm p-1 rounded-xl shadow-md transition-colors duration-300 ${
            darkMode ? 'bg-slate-800/80' : 'bg-white/80'
          }`}>
            <TabsTrigger
              value="calendar"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Atividades</span>
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Metas 2026</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <CalendarView
              tasks={tasks}
              appointments={appointments}
              categories={categories}
              onDateSelect={setSelectedDate}
              onToggleTask={handleToggleTask}
              onToggleAppointment={handleToggleAppointment}
              onDeleteTask={handleDeleteTask}
              onDeleteAppointment={handleDeleteAppointment}
              themeColor={themeColor}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <TasksView
              tasks={tasks}
              appointments={appointments}
              categories={categories}
              onToggleTask={handleToggleTask}
              onToggleAppointment={handleToggleAppointment}
              onDeleteTask={handleDeleteTask}
              onDeleteAppointment={handleDeleteAppointment}
              onAddCategory={() => setShowCategoryDialog(true)}
              themeColor={themeColor}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <GoalsView
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              themeColor={themeColor}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <DashboardView
              tasks={tasks}
              appointments={appointments}
              categories={categories}
              themeColor={themeColor}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileView
              profile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              themeColor={themeColor}
              onThemeColorChange={handleThemeColorChange}
              darkMode={darkMode}
              onDarkModeChange={handleDarkModeChange}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onAddCategory={handleAddCategory}
        categories={categories}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        themeColor={themeColor}
      />

      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onAddTask={handleAddTask}
        onAddAppointment={handleAddAppointment}
        categories={categories}
        selectedDate={selectedDate}
        themeColor={themeColor}
      />
    </div>
  );
}