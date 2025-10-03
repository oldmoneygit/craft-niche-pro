import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Plus, Trash2, Target, TrendingUp, ChartBar as BarChart3, Clock, Save } from 'lucide-react';
import { InlineFoodSearch } from '@/components/platform/InlineFoodSearch';
import { QuickPortionDialog } from '@/components/platform/QuickPortionDialog';
import { AIAssistant } from '@/components/platform/AIAssistant';
import { formatNutrient } from '@/lib/nutritionCalculations';
import { ClientProfile } from '@/types/clientProfile';
import { smartFoodSearch } from '@/lib/smartFoodSearch';

// Debug mode apenas em desenvolvimento
const DEBUG_MODE = import.meta.env.DEV;

interface Meal {
  id: string;
  name: string;
  time: string;
  items: any[];
}

export default function PlatformMealPlanEditor() {
  console.log('🟢 PlatformMealPlanEditor renderizado');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenantId } = useTenantId();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');

  console.log('🔵 Params:', { clientId, allParams: Object.fromEntries(searchParams) });

  // Carregar template se fornecido na URL
  useEffect(() => {
    console.log('🔵 useEffect searchParams executado');
    const templateId = searchParams.get('templateId');
    console.log('🔵 templateId da URL:', templateId);

    if (templateId) {
      console.log('🔵 Chamando loadTemplateData...');
      loadTemplateData(templateId);
    } else {
      console.log('🔵 Nenhum templateId encontrado na URL');
    }
  }, [searchParams]);

  const loadTemplateData = async (templateId: string) => {
    try {
      console.log('🔵 Iniciando loadTemplateData com:', templateId);

      // 1. Buscar template SEM measures no JOIN
      console.log('🔵 Buscando template no banco...');
      const { data: template, error: templateError } = await supabase
        .from('meal_plan_templates')
        .select(`
          id,
          name,
          description,
          reference_calories,
          reference_protein,
          reference_carbs,
          reference_fat,
          meal_plan_template_meals (
            id,
            name,
            time,
            order_index,
            meal_plan_template_foods (
              id,
              quantity,
              food_id,
              measure_id,
              foods (
                id,
                name,
                energy_kcal,
                protein_g,
                carbohydrate_g,
                lipid_g,
                source
              )
            )
          )
        `)
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.error('❌ Erro ao buscar template:', templateError);
        throw templateError;
      }

      if (!template) {
        console.error('❌ Template não encontrado');
        return;
      }

      console.log('✅ Template carregado:', template);
      console.log('🔵 Número de refeições:', template.meal_plan_template_meals?.length || 0);

      // 2. Buscar measure_ids únicos
      console.log('🔵 Coletando measure_ids...');
      const measureIds = new Set<string>();
      template.meal_plan_template_meals?.forEach((meal: any) => {
        meal.meal_plan_template_foods?.forEach((food: any) => {
          if (food.measure_id) measureIds.add(food.measure_id);
        });
      });

      console.log('📏 Measure IDs coletados:', Array.from(measureIds));
      console.log('🔵 Total de measures únicos:', measureIds.size);

      // 3. Buscar todas as measures
      console.log('🔵 Buscando measures na tabela food_measures...');
      const { data: measuresData, error: measuresError } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams')
        .in('id', Array.from(measureIds));

      if (measuresError) {
        console.error('❌ Erro ao buscar measures:', measuresError);
        throw measuresError;
      }

      console.log('✅ Measures carregadas:', measuresData);
      console.log('🔵 Total de measures encontrados:', measuresData?.length || 0);

      // 4. Criar map de measures
      const measuresMap = new Map(
        measuresData?.map(m => [m.id, m]) || []
      );

      // 5. Associar measures aos foods
      template.meal_plan_template_meals?.forEach((meal: any) => {
        meal.meal_plan_template_foods?.forEach((food: any) => {
          food.measures = measuresMap.get(food.measure_id);
        });
      });

      // 6. Incrementar contador de uso
      await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });

      // 7. Popular formulário com dados do template
      setPlanName(`${template.name} - Cópia`);
      setPlanDescription(template.description || '');
      setGoals({
        kcal: template.reference_calories || 2000,
        protein: template.reference_protein || 150,
        carb: template.reference_carbs || 250,
        fat: template.reference_fat || 65
      });

      // 8. Converter estrutura do template para meals
      console.log('🔵 Convertendo estrutura do template para meals...');

      if (template.meal_plan_template_meals && template.meal_plan_template_meals.length > 0) {
        const convertedMeals = template.meal_plan_template_meals.map((meal: any, index: number) => {
          console.log(`🔵 Convertendo meal ${index}: ${meal.name}`);
          console.log(`🔵   - Número de foods: ${meal.meal_plan_template_foods?.length || 0}`);

          return {
            id: `temp-${Date.now()}-${Math.random()}`,
            name: meal.name,
            time: meal.time || '12:00',
            order_index: meal.order_index,
            items: meal.meal_plan_template_foods?.map((food: any) => {
              const grams = food.quantity * (food.measures?.grams || 100);
              const multiplier = grams / 100;

              const item = {
                id: `temp-${Date.now()}-${Math.random()}`,
                food_id: food.food_id,
                measure_id: food.measure_id,
                quantity: food.quantity,
                grams_total: grams,
                kcal_total: Math.round((food.foods?.energy_kcal || 0) * multiplier),
                protein_total: Math.round((food.foods?.protein_g || 0) * multiplier * 10) / 10,
                carb_total: Math.round((food.foods?.carbohydrate_g || 0) * multiplier * 10) / 10,
                fat_total: Math.round((food.foods?.lipid_g || 0) * multiplier * 10) / 10,
                foods: food.foods,
                measures: food.measures
              };

              console.log(`🔵     - Food: ${food.foods?.name} (${grams}g, ${item.kcal_total} kcal)`);
              return item;
            }) || []
          };
        });

        console.log('✅ Refeições convertidas:', convertedMeals);
        console.log('🔵 Total de refeições convertidas:', convertedMeals.length);

        console.log('🔵 Setando estados (setPlanName, setGoals, setMeals)...');
        setMeals(convertedMeals);
        console.log('✅ Estado meals atualizado!');
      } else {
        console.log('⚠️ Nenhuma refeição para converter');
      }

      console.log('🔵 Mostrando toast...');
      toast({
        title: "Template carregado!",
        description: `Plano baseado em "${template.name}". Ajuste conforme necessário e salve.`
      });

      console.log('✅ loadTemplateData concluído com sucesso!');

    } catch (error: any) {
      console.error('❌ ERRO FATAL em loadTemplateData:', error);
      console.error('❌ Stack trace:', error.stack);
      toast({
        title: "Erro ao carregar template",
        description: error.message,
        variant: "destructive"
      });
    }
  };


  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Café da Manhã', time: '09:00', items: [] }
  ]);
  const [goals, setGoals] = useState({
    kcal: 2000,
    protein: 150,
    carb: 250,
    fat: 67
  });
  const [saving, setSaving] = useState(false);
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<{
    food: any;
    mealId: string;
  } | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);

  const totals = meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.kcal += item.kcal_total || 0;
      acc.protein += item.protein_total || 0;
      acc.carb += item.carb_total || 0;
      acc.fat += item.fat_total || 0;
    });
    return acc;
  }, { kcal: 0, protein: 0, carb: 0, fat: 0 });

  const progress = {
    kcal: Math.min(100, (totals.kcal / goals.kcal) * 100),
    protein: Math.min(100, (totals.protein / goals.protein) * 100),
    carb: Math.min(100, (totals.carb / goals.carb) * 100),
    fat: Math.min(100, (totals.fat / goals.fat) * 100)
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: 'Nova Refeição',
      time: '12:00',
      items: []
    };
    setMeals([...meals, newMeal]);
  };

  const handleRemoveMeal = (mealId: string) => {
    setMeals(meals.filter(m => m.id !== mealId));
  };

  useEffect(() => {
    if (clientId) {
      supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
        .then(({ data }) => {
          if (data) {
            const clientData = data as any;
            setClientProfile({
              id: clientData.id,
              name: clientData.name,
              age: clientData.age || 30,
              gender: clientData.gender || 'other',
              height_cm: clientData.height_cm || clientData.height || 170,
              weight_kg: clientData.weight_kg || clientData.weight_current || 70,
              activity_level: clientData.activity_level || 'moderate',
              goal: (clientData.goal || 'maintenance') as 'maintenance' | 'weight_loss' | 'muscle_gain' | 'health',
              dietary_restrictions: clientData.dietary_restrictions || [],
              allergies: typeof clientData.allergies === 'string' ? [clientData.allergies] : (clientData.allergies || []),
              dislikes: clientData.dislikes || [],
              meal_preferences: clientData.meal_preferences || [],
              budget: clientData.budget || 'medium',
              medical_conditions: clientData.medical_conditions || [],
              medications: clientData.medications || [],
              notes: clientData.notes || ''
            });
          }
        });
    }
  }, [clientId]);

  const handleApplyGeneratedPlan = async (plan: any) => {
    if (DEBUG_MODE) {
      console.log('\n🚀 APLICANDO PLANO DA IA');
      console.log('🎯 Meta:', plan.targetCalories, 'kcal');
    }

    setGoals({
      kcal: plan.targetCalories,
      protein: plan.macros.protein_g,
      carb: plan.macros.carb_g,
      fat: plan.macros.fat_g
    });

    let totalAdded = 0;
    let totalNotFound = 0;
    const notFoundList: string[] = [];

    const newMeals = await Promise.all(
      plan.meals.map(async (aiMeal: any) => {
        if (DEBUG_MODE) {
          console.log(`\n📋 Refeição: ${aiMeal.name} (${aiMeal.targetCalories} kcal)`);
        }

        const items = [];

        for (const aiItem of aiMeal.items) {
          const food = await smartFoodSearch(aiItem.food_name);

          if (food) {
            const { data: measures } = await supabase
              .from('food_measures')
              .select('*')
              .eq('food_id', food.id)
              .order('is_default', { ascending: false });

            let measure = measures?.[0];

            if (!measure) {
              measure = {
                id: `temp-${Date.now()}`,
                food_id: food.id,
                measure_name: 'gramas',
                grams: 100,
                grams_equivalent: 100,
                is_default: true,
                created_at: new Date().toISOString()
              };
            }

            const quantityInGrams = aiItem.quantity;
            const measureGrams = measure.grams || 100;

            const quantityOfMeasures = quantityInGrams / measureGrams;

            const multiplier = quantityInGrams / 100;

            const item = {
              id: `${Date.now()}-${Math.random()}`,
              food_id: food.id,
              measure_id: measure.id,
              quantity: quantityOfMeasures,
              food,
              measure,
              kcal_total: Math.round(food.energy_kcal * multiplier),
              protein_total: Math.round(food.protein_g * multiplier * 10) / 10,
              carb_total: Math.round(food.carbohydrate_g * multiplier * 10) / 10,
              fat_total: Math.round(food.lipid_g * multiplier * 10) / 10
            };

            items.push(item);
            totalAdded++;

            if (DEBUG_MODE) {
              console.log(`  ✅ ${food.name}`);
              console.log(`     ${quantityInGrams}g = ${item.kcal_total} kcal`);
              console.log(`     P: ${item.protein_total}g | C: ${item.carb_total}g | G: ${item.fat_total}g`);
            }
          } else {
            totalNotFound++;
            notFoundList.push(aiItem.food_name);
            if (DEBUG_MODE) {
              console.log(`  ❌ "${aiItem.food_name}" - NÃO ENCONTRADO`);
            }
          }
        }

        return {
          id: `${Date.now()}-${Math.random()}`,
          name: aiMeal.name,
          time: aiMeal.time,
          items
        };
      })
    );

    setMeals(newMeals);

    const totals = newMeals.reduce((acc, meal) => {
      meal.items.forEach(item => {
        acc.kcal += item.kcal_total;
        acc.protein += item.protein_total;
        acc.carb += item.carb_total;
        acc.fat += item.fat_total;
      });
      return acc;
    }, { kcal: 0, protein: 0, carb: 0, fat: 0 });

    if (DEBUG_MODE) {
      console.log('\n📊 TOTAIS IMPLEMENTADOS:');
      console.log(`  Calorias: ${totals.kcal} / ${plan.targetCalories} (${Math.round(totals.kcal/plan.targetCalories*100)}%)`);
      console.log(`  Proteínas: ${totals.protein}g / ${plan.macros.protein_g}g`);
      console.log(`  Carbos: ${totals.carb}g / ${plan.macros.carb_g}g`);
      console.log(`  Gorduras: ${totals.fat}g / ${plan.macros.fat_g}g`);
      console.log(`\n✅ Adicionados: ${totalAdded}`);
      console.log(`❌ Não encontrados: ${totalNotFound}`);
    }

    if (totalNotFound > 0) {
      toast({
        title: `Plano parcialmente aplicado`,
        description: `${totalAdded} alimentos OK. ${totalNotFound} não encontrados no banco TACO.`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Plano aplicado com sucesso!',
        description: `${totalAdded} alimentos com ${totals.kcal} kcal (${Math.round(totals.kcal/plan.targetCalories*100)}% da meta)`
      });
    }
  };

  const getDefaultTimeForMeal = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('café')) return '08:00';
    if (lower.includes('lanche') && lower.includes('manhã')) return '10:00';
    if (lower.includes('almoço')) return '12:00';
    if (lower.includes('lanche') && lower.includes('tarde')) return '15:00';
    if (lower.includes('jantar')) return '19:00';
    return '12:00';
  };

  const handleAddFoodToMeal = (mealId: string, item: any) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return { ...meal, items: [...meal.items, { ...item, id: Date.now().toString() }] };
      }
      return meal;
    }));

    toast({
      title: 'Alimento adicionado',
      description: `${item.quantity} ${item.measure.measure_name} de ${item.food.name}`
    });
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return { ...meal, items: meal.items.filter(i => i.id !== itemId) };
      }
      return meal;
    }));
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para o plano alimentar',
        variant: 'destructive'
      });
      return;
    }

    if (!tenantId) {
      toast({
        title: 'Erro de autenticação',
        description: 'Tenant não encontrado. Faça login novamente.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Salvando plano alimentar...');
      console.log('Client ID:', clientId);
      console.log('Tenant ID:', tenantId);
      
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          client_id: clientId,
          tenant_id: tenantId,
          name: planName,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calorie_target: goals.kcal,
          protein_target_g: goals.protein,
          carb_target_g: goals.carb,
          fat_target_g: goals.fat,
          status: 'ativo',
          active: true,
          is_active: true,
          notes: planDescription,
          plan_data: { breakfast: [], lunch: [], dinner: [], snacks: [] }
        } as any)
        .select()
        .single();

      if (planError) {
        console.error('❌ Erro ao criar meal_plan:', planError);
        throw planError;
      }
      
      console.log('✅ Plano criado:', plan.id);

      console.log('💾 Salvando refeições...');
      for (const meal of meals) {
        const { data: mealData, error: mealError } = await supabase
          .from('meal_plan_meals')
          .insert({
            meal_plan_id: plan.id,
            name: meal.name,
            time: meal.time,
            order_index: meals.indexOf(meal)
          })
          .select()
          .single();

        if (mealError) {
          console.error('❌ Erro ao criar refeição:', mealError);
          throw mealError;
        }

        console.log(`✅ Refeição criada: ${meal.name}`);

        if (meal.items.length > 0) {
          for (const item of meal.items) {
            const { error: itemError } = await supabase
              .from('meal_items')
              .insert({
                meal_id: mealData.id,
                food_id: item.food_id,
                measure_id: item.measure_id,
                quantity: item.quantity,
                kcal_total: item.kcal_total,
                protein_total: item.protein_total,
                carb_total: item.carb_total,
                fat_total: item.fat_total,
                grams_total: item.grams_total || (item.quantity * (item.measure?.grams || 100))
              });
            
            if (itemError) {
              console.error('❌ Erro ao adicionar alimento:', itemError);
              throw itemError;
            }
            
            console.log(`  ✅ Adicionado: ${item.food?.name}`);
          }
        }
      }
      
      console.log('✅ Plano completo salvo com sucesso!');

      toast({
        title: 'Plano salvo com sucesso!',
        description: 'O plano alimentar foi criado'
      });
      navigate(-1);
    } catch (error: any) {
      console.error('❌ Erro completo ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const Sidebar = () => (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Metas Diárias</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Calorias (kcal)</label>
            <Input
              type="number"
              value={goals.kcal}
              onChange={(e) => setGoals({ ...goals, kcal: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Proteínas (g)</label>
            <Input
              type="number"
              value={goals.protein}
              onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Carboidratos (g)</label>
            <Input
              type="number"
              value={goals.carb}
              onChange={(e) => setGoals({ ...goals, carb: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Gorduras (g)</label>
            <Input
              type="number"
              value={goals.fat}
              onChange={(e) => setGoals({ ...goals, fat: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Progresso</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Calorias</span>
              <span className="font-medium">{totals.kcal.toFixed(0)} / {goals.kcal}</span>
            </div>
            <Progress value={progress.kcal} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Proteínas</span>
              <span className="font-medium">{totals.protein.toFixed(1)}g / {goals.protein}g</span>
            </div>
            <Progress value={progress.protein} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Carboidratos</span>
              <span className="font-medium">{totals.carb.toFixed(1)}g / {goals.carb}g</span>
            </div>
            <Progress value={progress.carb} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Gorduras</span>
              <span className="font-medium">{totals.fat.toFixed(1)}g / {goals.fat}g</span>
            </div>
            <Progress value={progress.fat} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Distribuição Macro</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {((totals.protein * 4 / totals.kcal) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Proteína</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {((totals.carb * 4 / totals.kcal) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Carbos</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {((totals.fat * 9 / totals.kcal) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Gorduras</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Novo Plano Alimentar</h1>
              <p className="text-sm text-muted-foreground">
                {meals.reduce((acc, m) => acc + m.items.length, 0)} alimentos adicionados
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-80 xl:w-96 border-r overflow-y-auto">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nome do Plano
                  </label>
                  <Input
                    placeholder="Ex: Plano de Emagrecimento - João"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Observações (opcional)
                  </label>
                  <Textarea
                    placeholder="Adicione observações sobre este plano..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {clientProfile && (
              <AIAssistant
                clientProfile={clientProfile}
                onApplyPlan={handleApplyGeneratedPlan}
              />
            )}

            <div className="space-y-4">
              {meals.map((meal) => (
                <Card key={meal.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <Input
                          value={meal.name}
                          onChange={(e) => {
                            setMeals(meals.map(m =>
                              m.id === meal.id ? { ...m, name: e.target.value } : m
                            ));
                          }}
                          className="font-semibold text-lg border-none shadow-none focus-visible:ring-0 px-0"
                        />
                        <Input
                          type="time"
                          value={meal.time}
                          onChange={(e) => {
                            setMeals(meals.map(m =>
                              m.id === meal.id ? { ...m, time: e.target.value } : m
                            ));
                          }}
                          className="w-32"
                        />
                      </div>
                      {meals.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMeal(meal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {meal.items.length > 0 && (
                      <div className="space-y-2">
                        {meal.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 group hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium mb-1">
                                {item.quantity} {item.measure.measure_name} de {item.food.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.kcal_total.toFixed(0)} kcal |
                                P: {formatNutrient(item.protein_total)} |
                                C: {formatNutrient(item.carb_total)} |
                                G: {formatNutrient(item.fat_total)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(meal.id, item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {meal.items.length > 0 && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Total da refeição:</span>
                          <span>
                            {meal.items.reduce((acc, i) => acc + (i.kcal_total || 0), 0).toFixed(0)} kcal |
                            P: {formatNutrient(meal.items.reduce((acc, i) => acc + (i.protein_total || 0), 0))} |
                            C: {formatNutrient(meal.items.reduce((acc, i) => acc + (i.carb_total || 0), 0))} |
                            G: {formatNutrient(meal.items.reduce((acc, i) => acc + (i.fat_total || 0), 0))}
                          </span>
                        </div>
                      </div>
                    )}

                    <InlineFoodSearch
                      onAddFood={(item) => handleAddFoodToMeal(meal.id, item)}
                      placeholder="Buscar e adicionar alimento... (⌘K)"
                    />
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={handleAddMeal}
                className="w-full border-dashed border-2 h-12"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Refeição
              </Button>
            </div>
          </div>
        </main>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="lg:hidden fixed bottom-6 right-6 rounded-full shadow-lg z-30"
            >
              <Target className="w-5 h-5 mr-2" />
              Metas
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {selectedFoodForPortion && (
        <QuickPortionDialog
          food={selectedFoodForPortion.food}
          isOpen={!!selectedFoodForPortion}
          onClose={() => setSelectedFoodForPortion(null)}
          onConfirm={(item) => {
            handleAddFoodToMeal(selectedFoodForPortion.mealId, item);
            setSelectedFoodForPortion(null);
          }}
        />
      )}
    </div>
  );
}
