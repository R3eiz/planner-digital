'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/lib/types';
import { Crown, Check, Palette, Sun, Moon, Plus, Trash2, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getCustomColors, saveCustomColors } from '@/lib/storage';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
}

const PRESET_COLORS = [
  { name: 'Azul Céu', color: '#0ea5e9' },
  { name: 'Azul Índigo', color: '#6366f1' },
  { name: 'Ciano', color: '#06b6d4' },
  { name: 'Verde Água', color: '#14b8a6' },
  { name: 'Azul Escuro', color: '#1e40af' },
  { name: 'Roxo', color: '#8b5cf6' },
  { name: 'Rosa', color: '#ec4899' },
  { name: 'Laranja', color: '#f97316' },
  { name: 'Verde', color: '#10b981' },
  { name: 'Vermelho', color: '#ef4444' },
  { name: 'Amarelo', color: '#eab308' },
  { name: 'Violeta', color: '#a855f7' },
];

export default function ProfileView({ 
  profile, 
  onUpdateProfile, 
  themeColor, 
  onThemeColorChange,
  darkMode,
  onDarkModeChange
}: ProfileViewProps) {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [newCustomColor, setNewCustomColor] = useState('#0ea5e9');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
    setCustomColors(getCustomColors());
  }, [profile]);

  const handleSave = () => {
    if (profile) {
      onUpdateProfile({
        ...profile,
        name,
        email,
      });
    }
  };

  const handleUpgradePlan = (planType: 'monthly') => {
    if (profile) {
      const now = new Date();
      const expiryDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

      onUpdateProfile({
        ...profile,
        plan: {
          type: planType,
          startDate: new Date().toISOString(),
          expiryDate,
        },
      });
    }
  };

  const handleAddCustomColor = () => {
    const updatedColors = [...customColors, newCustomColor];
    setCustomColors(updatedColors);
    saveCustomColors(updatedColors);
    setNewCustomColor('#0ea5e9');
  };

  const handleDeleteCustomColor = (colorToDelete: string) => {
    const updatedColors = customColors.filter(c => c !== colorToDelete);
    setCustomColors(updatedColors);
    saveCustomColors(updatedColors);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getPlanBadge = () => {
    if (!profile) return null;
    
    switch (profile.plan.type) {
      case 'monthly':
        return <Badge className="bg-blue-500">Plano Mensal</Badge>;
      default:
        return <Badge variant="secondary">Plano Gratuito</Badge>;
    }
  };

  const getPlanExpiryText = () => {
    if (!profile || !profile.plan.expiryDate) return null;
    
    const expiryDate = new Date(profile.plan.expiryDate);
    const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
        Válido por mais {daysLeft} dias
      </p>
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Informações do Perfil
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleSave}
            className="w-full"
            style={{ backgroundColor: themeColor }}
          >
            Salvar Alterações
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </Card>

      {/* Plan Info */}
      <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Seu Plano
          </h3>
        </div>
        
        <div className="mb-6">
          {getPlanBadge()}
          {getPlanExpiryText()}
        </div>

        {profile?.plan.type === 'free' && (
          <div className="space-y-4">
            {/* Monthly Plan */}
            <div className="p-6 border-2 border-blue-200 dark:border-blue-700 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Assinatura Mensal</h4>
                <Badge variant="secondary">Recomendado</Badge>
              </div>
              <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                R$ 24,90
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">/mês</span>
              </p>
              <ul className="space-y-2 my-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Tarefas ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Categorias personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Dashboard completo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Personalização de cores
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Modo noturno/diurno
                </li>
              </ul>
              <Button 
                onClick={() => handleUpgradePlan('monthly')}
                className="w-full"
                style={{ backgroundColor: themeColor }}
              >
                Assinar Agora
              </Button>
            </div>
          </div>
        )}

        {profile?.plan.type !== 'free' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✨ Você tem acesso completo a todas as funcionalidades do NOVUS 2026!
            </p>
          </div>
        )}
      </Card>

      {/* Theme Customization */}
      <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5" style={{ color: themeColor }} />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Personalização Visual
          </h3>
        </div>
        
        {/* Dark Mode Toggle */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
              <div>
                <Label className="text-base font-medium">Modo {darkMode ? 'Noturno' : 'Diurno'}</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {darkMode ? 'Interface escura para ambientes com pouca luz' : 'Interface clara e vibrante'}
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={onDarkModeChange}
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div className="mb-6">
          <Label className="mb-3 block">Cores Predefinidas</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => onThemeColorChange(preset.color)}
                className={`aspect-square rounded-xl transition-all duration-200 hover:scale-110 relative group ${
                  themeColor === preset.color 
                    ? 'ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-slate-400 scale-110' 
                    : ''
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              >
                {themeColor === preset.color && (
                  <Check className="w-6 h-6 text-white mx-auto absolute inset-0 m-auto" />
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div>
          <Label className="mb-3 block">Minhas Cores Personalizadas</Label>
          
          {/* Add Custom Color */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                type="color"
                value={newCustomColor}
                onChange={(e) => setNewCustomColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={newCustomColor}
                onChange={(e) => setNewCustomColor(e.target.value)}
                placeholder="#0ea5e9"
                className="flex-1"
              />
            </div>
            <Button
              onClick={handleAddCustomColor}
              size="icon"
              style={{ backgroundColor: themeColor }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Custom Colors Grid */}
          {customColors.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {customColors.map((color, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => onThemeColorChange(color)}
                    className={`aspect-square rounded-xl transition-all duration-200 hover:scale-110 w-full ${
                      themeColor === color 
                        ? 'ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-slate-400 scale-110' 
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {themeColor === color && (
                      <Check className="w-6 h-6 text-white mx-auto" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteCustomColor(color)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <Palette className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhuma cor personalizada ainda
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Crie suas próprias cores usando o seletor acima
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
          💡 A cor escolhida será aplicada em todo o planner
        </p>
      </Card>
    </div>
  );
}
