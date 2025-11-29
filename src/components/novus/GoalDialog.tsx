'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal } from '@/lib/types';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveGoal: (goal: Goal) => void;
  goal?: Goal;
}

const categoryOptions = [
  { value: 'health', label: '💪 Saúde', color: '#10b981' },
  { value: 'finance', label: '💰 Finanças', color: '#f59e0b' },
  { value: 'career', label: '🚀 Carreira', color: '#3b82f6' },
  { value: 'personal', label: '✨ Pessoal', color: '#ec4899' },
  { value: 'education', label: '📚 Educação', color: '#8b5cf6' },
  { value: 'other', label: '🎯 Outros', color: '#6366f1' },
];

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

export default function GoalDialog({ open, onOpenChange, onSaveGoal, goal }: GoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<Goal['category']>('personal');
  const [color, setColor] = useState('#3b82f6');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setTargetValue(goal.targetValue.toString());
      setCurrentValue(goal.currentValue.toString());
      setUnit(goal.unit);
      setCategory(goal.category);
      setColor(goal.color);
      setDeadline(goal.deadline);
      setImageUrl(goal.imageUrl || '');
      setImagePreview(goal.imageUrl || '');
    } else {
      resetForm();
    }
  }, [goal, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetValue('');
    setCurrentValue('0');
    setUnit('');
    setCategory('personal');
    setColor('#3b82f6');
    setDeadline('2026-12-31');
    setImageUrl('');
    setImagePreview('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!title || !targetValue || !unit) return;

    const newGoal: Goal = {
      id: goal?.id || Date.now().toString(),
      title,
      description,
      targetValue: parseFloat(targetValue),
      currentValue: parseFloat(currentValue) || 0,
      unit,
      category,
      color,
      deadline,
      imageUrl: imageUrl || undefined,
      createdAt: goal?.createdAt || new Date().toISOString(),
      milestones: goal?.milestones || [],
    };

    onSaveGoal(newGoal);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {goal ? 'Editar Meta' : 'Nova Meta para 2026'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem da Meta (Opcional)</Label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-sm text-slate-600 mb-1">
                  Clique para adicionar uma imagem
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG até 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta *</Label>
            <Input
              id="title"
              placeholder="Ex: Perder 10kg, Juntar R$ 5.000"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva sua meta e como pretende alcançá-la..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Goal['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Values */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentValue">Valor Atual *</Label>
              <Input
                id="currentValue"
                type="number"
                placeholder="0"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetValue">Meta *</Label>
              <Input
                id="targetValue"
                type="number"
                placeholder="100"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Input
                id="unit"
                placeholder="kg, R$, dias"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo Final *</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max="2026-12-31"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Cor da Meta *</Label>
            <div className="grid grid-cols-9 gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c ? 'ring-4 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!title || !targetValue || !unit}
              style={{ backgroundColor: color }}
            >
              {goal ? 'Salvar Alterações' : 'Criar Meta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
