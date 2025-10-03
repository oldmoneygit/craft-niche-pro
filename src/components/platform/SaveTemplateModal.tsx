import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  mealPlanId: string;
  currentPlan: {
    calorie_target: number;
    protein_target_g: number;
    carb_target_g: number;
    fat_target_g: number;
    goal?: string;
  };
}

export function SaveTemplateModal({ 
  open, 
  onClose, 
  mealPlanId, 
  currentPlan 
}: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome ao template.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 1. Buscar dados do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) {
        throw new Error('Perfil não encontrado');
      }
      
      // 2. Criar template
      const { data: template, error: templateError } = await supabase
        .from('meal_plan_templates')
        .insert({
          tenant_id: profile.tenant_id,
          created_by: profile.id,
          name: name.trim(),
          description: description.trim() || null,
          reference_calories: Math.round(currentPlan.calorie_target || 2000),
          reference_protein: currentPlan.protein_target_g || 150,
          reference_carbs: currentPlan.carb_target_g || 250,
          reference_fat: currentPlan.fat_target_g || 67,
          objective: currentPlan.goal || null,
          tags: tags.length > 0 ? tags : null
        })
        .select()
        .single();
      
      if (templateError) throw templateError;
      
      // 3. Buscar refeições do plano original
      const { data: meals } = await supabase
        .from('meal_plan_meals')
        .select(`
          id,
          name,
          time,
          order_index,
          meal_items (
            food_id,
            measure_id,
            quantity
          )
        `)
        .eq('meal_plan_id', mealPlanId)
        .order('order_index');
      
      // 4. Copiar estrutura para o template
      for (const meal of meals || []) {
        // Criar refeição no template
        const { data: templateMeal } = await supabase
          .from('meal_plan_template_meals')
          .insert({
            template_id: template.id,
            name: meal.name,
            time: meal.time,
            order_index: meal.order_index
          })
          .select()
          .single();
        
        // Copiar alimentos
        if (templateMeal && meal.meal_items && meal.meal_items.length > 0) {
          const templateFoods = meal.meal_items.map((food: any) => ({
            meal_id: templateMeal.id,
            food_id: food.food_id,
            measure_id: food.measure_id,
            quantity: food.quantity
          }));
          
          await supabase
            .from('meal_plan_template_foods')
            .insert(templateFoods);
        }
      }
      
      toast({
        title: "✅ Template salvo!",
        description: `"${name}" está disponível na biblioteca de templates.`
      });
      
      onClose();
      setName('');
      setDescription('');
      setTags([]);
      
    } catch (error: any) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Salvar como Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Nome */}
          <div>
            <Label htmlFor="template-name">Nome do Template *</Label>
            <Input
              id="template-name"
              placeholder="Ex: Plano Hipertrofia 2500kcal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          {/* Descrição */}
          <div>
            <Label htmlFor="template-desc">Descrição (opcional)</Label>
            <Textarea
              id="template-desc"
              placeholder="Ex: Ideal para ganho de massa muscular moderado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          
          {/* Tags */}
          <div>
            <Label htmlFor="template-tags">Tags (opcional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="template-tags"
                placeholder="Ex: vegetariano, low-carb"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addTag}
              >
                Adicionar
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Preview dos valores de referência */}
          <div className="bg-muted p-3 rounded-md text-sm space-y-1">
            <p className="font-medium">Valores de referência:</p>
            <p>Calorias: {Math.round(currentPlan.calorie_target || 0)} kcal</p>
            <p>Proteínas: {(currentPlan.protein_target_g || 0).toFixed(1)}g</p>
            <p>Carboidratos: {(currentPlan.carb_target_g || 0).toFixed(1)}g</p>
            <p>Gorduras: {(currentPlan.fat_target_g || 0).toFixed(1)}g</p>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
