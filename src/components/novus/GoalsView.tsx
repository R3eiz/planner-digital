'use client';

import { useState } from 'react';
import { Plus, Target, TrendingUp, Award, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Goal } from '@/lib/types';
import GoalDialog from './GoalDialog';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  themeColor: string;
}

const categoryLabels = {
  health: 'Saúde',
  finance: 'Finanças',
  career: 'Carreira',
  personal: 'Pessoal',
  education: 'Educação',
  other: 'Outros',
};

const categoryIcons = {
  health: '💪',
  finance: '💰',
  career: '🚀',
  personal: '✨',
  education: '📚',
  other: '🎯',
};

export default function GoalsView({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  themeColor,
}: GoalsViewProps) {
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredGoals = filterCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === filterCategory);

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalDialog(true);
  };

  const handleCloseDialog = () => {
    setShowGoalDialog(false);
    setSelectedGoal(undefined);
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const completedGoals = goals.filter(g => g.currentValue >= g.targetValue).length;
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + calculateProgress(g), 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Metas Totais</p>
              <p className="text-3xl font-bold mt-1">{goals.length}</p>
            </div>
            <Target className="w-10 h-10 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Concluídas</p>
              <p className="text-3xl font-bold mt-1">{completedGoals}</p>
            </div>
            <Award className="w-10 h-10 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Progresso Médio</p>
              <p className="text-3xl font-bold mt-1">{totalProgress}%</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('all')}
            className="rounded-full"
            style={filterCategory === 'all' ? { backgroundColor: themeColor } : {}}
          >
            Todas
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filterCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(key)}
              className="rounded-full"
              style={filterCategory === key ? { backgroundColor: themeColor } : {}}
            >
              {categoryIcons[key as keyof typeof categoryIcons]} {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Add Goal Button */}
      <Button
        onClick={() => setShowGoalDialog(true)}
        className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-14"
        style={{ backgroundColor: themeColor }}
      >
        <Plus className="w-5 h-5 mr-2" />
        Adicionar Nova Meta para 2026
      </Button>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm shadow-lg">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Nenhuma meta encontrada
          </h3>
          <p className="text-slate-500 mb-6">
            Comece criando sua primeira meta para 2026!
          </p>
          <Button
            onClick={() => setShowGoalDialog(true)}
            style={{ backgroundColor: themeColor }}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Meta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = goal.currentValue >= goal.targetValue;

            return (
              <Card
                key={goal.id}
                className="overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
              >
                {/* Image */}
                {goal.imageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={goal.imageUrl}
                      alt={goal.title}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                    />
                    <Badge
                      className="absolute top-3 right-3 text-xs"
                      style={{ backgroundColor: goal.color }}
                    >
                      {categoryIcons[goal.category]} {categoryLabels[goal.category]}
                    </Badge>
                  </div>
                ) : (
                  <div 
                    className="h-48 flex items-center justify-center relative"
                    style={{ backgroundColor: goal.color + '20' }}
                  >
                    <div className="text-6xl">
                      {categoryIcons[goal.category]}
                    </div>
                    <Badge
                      className="absolute top-3 right-3 text-xs"
                      style={{ backgroundColor: goal.color }}
                    >
                      {categoryLabels[goal.category]}
                    </Badge>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {goal.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progresso</span>
                      <span className="font-bold" style={{ color: goal.color }}>
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{goal.currentValue} {goal.unit}</span>
                      <span>{goal.targetValue} {goal.unit}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-sm">
                      {isCompleted ? (
                        <Badge className="bg-green-500">
                          ✓ Concluída
                        </Badge>
                      ) : daysRemaining > 0 ? (
                        <span className="text-slate-600">
                          {daysRemaining} dias restantes
                        </span>
                      ) : (
                        <Badge variant="destructive">
                          Prazo expirado
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Dialog */}
      <GoalDialog
        open={showGoalDialog}
        onOpenChange={handleCloseDialog}
        onSaveGoal={(goal) => {
          if (selectedGoal) {
            onUpdateGoal(goal);
          } else {
            onAddGoal(goal);
          }
          handleCloseDialog();
        }}
        goal={selectedGoal}
      />
    </div>
  );
}
