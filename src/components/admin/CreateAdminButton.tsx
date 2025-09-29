import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createAdminUser } from '@/utils/createAdminUser';
import { Loader2 } from 'lucide-react';

export default function CreateAdminButton() {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setCreating(true);
    try {
      await createAdminUser();
      toast({
        title: 'Sucesso!',
        description: 'Usuário admin criado com sucesso. Email: jefersoncemep@gmail.com | Senha: admin123',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar usuário admin. Talvez já exista.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateAdmin} 
      disabled={creating}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {creating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Criando...
        </>
      ) : (
        'Criar Usuário Admin Gabriel Gandin'
      )}
    </Button>
  );
}