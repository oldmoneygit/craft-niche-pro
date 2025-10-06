import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnamneseData {
  main_goal: string;
  clinical_observations: string;
  dietary_restrictions: string;
  alcohol_consumption: string;
  smoking: string;
  sleep_hours: number | null;
  physical_activity: string;
  eating_out_frequency: string;
  household_size: number | null;
  medical_conditions: string;
  current_medications: string;
  family_history: string;
  current_weight: number | null;
  height: number | null;
  target_weight: number | null;
  waist_circumference: number | null;
  hip_circumference: number | null;
  water_intake_liters: number | null;
  meals_per_day: number | null;
  stress_level: string;
  allergies: string;
  food_intolerances: string;
  food_preferences: string;
  food_dislikes: string;
  professional_notes: string;
}

export function useAnamnese(clientId: string) {
  return useQuery({
    queryKey: ['anamnese', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anamneses')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!clientId
  });
}

export function useSaveAnamnese() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      clientId, 
      tenantId, 
      data 
    }: { 
      clientId: string; 
      tenantId: string; 
      data: AnamneseData;
    }) => {
      // Check if anamnese exists
      const { data: existing } = await supabase
        .from('anamneses')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();
      
      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('anamneses')
          .update({ 
            ...data, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('anamneses')
          .insert({
            client_id: clientId,
            tenant_id: tenantId,
            anamnesis_date: new Date().toISOString().split('T')[0],
            ...data
          })
          .select()
          .single();
        
        if (error) throw error;
        return created;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anamnese', variables.clientId] });
      toast({ 
        title: 'Sucesso!',
        description: 'Anamnese salva com sucesso!' 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro',
        description: error.message || 'Erro ao salvar anamnese',
        variant: 'destructive'
      });
    }
  });
}
