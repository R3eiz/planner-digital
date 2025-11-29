'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/lib/types';
import { Plus, Trash2, Edit2, Palette } from 'lucide-react';
import { getCustomColors } from '@/lib/storage';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: Category) => void;
  categories: Category[];
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  themeColor: string;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
];

export default function CategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
  categories,
  onUpdateCategory,
  onDeleteCategory,
  themeColor,
}: CategoryDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('#0ea5e9');

  useEffect(() => {
    setCustomColors(getCustomColors());
  }, [open]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: selectedColor,
      };
      onAddCategory(newCategory);
      setNewCategoryName('');
      setSelectedColor(PRESET_COLORS[0]);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      onUpdateCategory({
        ...editingCategory,
        name: newCategoryName.trim(),
        color: selectedColor,
      });
      setEditingCategory(null);
      setNewCategoryName('');
      setSelectedColor(PRESET_COLORS[0]);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  const allColors = [...PRESET_COLORS, ...customColors];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Category Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    editingCategory ? handleUpdateCategory() : handleAddCategory();
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Cor</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomColorInput(!showCustomColorInput)}
                  className="h-8 text-xs"
                >
                  <Palette className="w-3 h-3 mr-1" />
                  {showCustomColorInput ? 'Ocultar' : 'Cor customizada'}
                </Button>
              </div>

              {/* Custom Color Input */}
              {showCustomColorInput && (
                <div className="flex gap-2 mb-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <Input
                    type="color"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="#0ea5e9"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedColor(customColorInput);
                      setShowCustomColorInput(false);
                    }}
                    size="sm"
                  >
                    Usar
                  </Button>
                </div>
              )}

              {/* Color Grid */}
              <div className="grid grid-cols-8 gap-2">
                {allColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`aspect-square rounded-lg transition-all duration-200 hover:scale-110 ${
                      selectedColor === color 
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' 
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {editingCategory ? (
                <>
                  <Button onClick={handleUpdateCategory} className="flex-1" style={{ backgroundColor: themeColor }}>
                    Salvar Alterações
                  </Button>
                  <Button onClick={cancelEditing} variant="outline">
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddCategory} className="w-full" style={{ backgroundColor: themeColor }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Categoria
                </Button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <Label>Categorias Existentes</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditing(category)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteCategory(category.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  Nenhuma categoria criada ainda
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
