'use client';

import { Card } from '@/components/ui/card';
import { Task, Appointment, Category } from '@/lib/types';
import { calculateProductivityStats } from '@/lib/storage';
import { TrendingUp, Target, CheckCircle2, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DashboardViewProps {
  tasks: Task[];
  appointments: Appointment[];
  categories: Category[];
  themeColor: string;
}

export default function DashboardView({ tasks, appointments, categories, themeColor }: DashboardViewProps) {
  const stats = calculateProductivityStats(tasks, appointments, categories);

  const StatCard = ({ 
    title, 
    completed, 
    total, 
    percentage, 
    icon: Icon 
  }: { 
    title: string; 
    completed: number; 
    total: number; 
    percentage: number; 
    icon: any;
  }) => (
    <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {completed}/{total}
          </h3>
        </div>
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${themeColor}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: themeColor }} />
        </div>
      </div>
      <Progress value={percentage} className="h-2 mb-2" />
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {percentage}% concluído
      </p>
    </Card>
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#94a3b8';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Hoje"
          completed={stats.daily.completed}
          total={stats.daily.total}
          percentage={stats.daily.percentage}
          icon={Calendar}
        />
        <StatCard
          title="Esta Semana"
          completed={stats.weekly.completed}
          total={stats.weekly.total}
          percentage={stats.weekly.percentage}
          icon={TrendingUp}
        />
        <StatCard
          title="Este Mês"
          completed={stats.monthly.completed}
          total={stats.monthly.total}
          percentage={stats.monthly.percentage}
          icon={Target}
        />
      </div>

      {/* Category Breakdown - MOSTRA TODAS AS CATEGORIAS */}
      <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5" style={{ color: themeColor }} />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Desempenho por Categoria
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* CORREÇÃO: Mostra TODAS as categorias, incluindo as novas sem atividades */}
          {stats.categoryBreakdown.map(cat => {
            const percentage = cat.total > 0 
              ? Math.round((cat.completed / cat.total) * 100) 
              : 0;
            
            return (
              <div key={cat.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(cat.categoryId) }}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {getCategoryName(cat.categoryId)}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {cat.total > 0 ? (
                      <>
                        {cat.completed}/{cat.total} ({percentage}%)
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Nenhuma atividade</span>
                    )}
                  </span>
                </div>
                {cat.total > 0 && (
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      backgroundColor: `${getCategoryColor(cat.categoryId)}20`
                    }}
                  />
                )}
                {cat.total === 0 && (
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full" />
                )}
              </div>
            );
          })}
          
          {stats.categoryBreakdown.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Nenhuma categoria criada ainda</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                Comece criando suas primeiras categorias
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 shadow-lg" style={{ borderColor: `${themeColor}40` }}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          💡 Insights de Produtividade
        </h3>
        <div className="space-y-3">
          {stats.daily.percentage === 100 && stats.daily.total > 0 && (
            <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                🎉 <strong>Parabéns!</strong> Você completou todas as tarefas de hoje!
              </p>
            </div>
          )}
          
          {stats.weekly.percentage >= 80 && stats.weekly.total > 0 && (
            <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                🔥 <strong>Excelente!</strong> Você está com {stats.weekly.percentage}% de conclusão esta semana!
              </p>
            </div>
          )}
          
          {stats.monthly.total > 0 && (
            <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                📊 Você tem <strong>{stats.monthly.total} tarefas</strong> registradas este mês.
              </p>
            </div>
          )}

          {stats.daily.total === 0 && stats.weekly.total === 0 && (
            <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                🚀 <strong>Comece agora!</strong> Crie suas primeiras tarefas e acompanhe seu progresso.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
