-- Verificar e criar política RLS de DELETE para leads se não existir

DO $$
BEGIN
  -- Verificar se já existe política de DELETE para leads
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'leads' 
    AND cmd = 'DELETE'
  ) THEN
    -- Criar política de DELETE
    CREATE POLICY "Users can delete their own leads"
    ON public.leads FOR DELETE
    TO authenticated
    USING (
      tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Política de DELETE criada com sucesso para tabela leads';
  ELSE
    RAISE NOTICE 'Política de DELETE já existe para tabela leads';
  END IF;
END $$;
