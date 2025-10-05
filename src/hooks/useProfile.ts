import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  tenant_id: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      console.log('👤 useProfile: No user, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('👤 useProfile: Fetching profile for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('👤 useProfile: Query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o perfil.',
          variant: 'destructive',
        });
      } else {
        console.log('✅ Profile loaded successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar perfil.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o perfil.',
          variant: 'destructive',
        });
        return null;
      }

      setProfile(data);
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      });
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar perfil.',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}