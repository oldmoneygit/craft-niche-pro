-- Fix RLS policy for questionnaire_templates INSERT
DROP POLICY IF EXISTS "Users can create templates" ON public.questionnaire_templates;

CREATE POLICY "Users can create templates" 
ON public.questionnaire_templates 
FOR INSERT 
TO authenticated
WITH CHECK (tenant_id = (
  SELECT profiles.tenant_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- Also fix the other policies to use user_id instead of id
DROP POLICY IF EXISTS "Users can delete templates" ON public.questionnaire_templates;
DROP POLICY IF EXISTS "Users can update templates" ON public.questionnaire_templates;
DROP POLICY IF EXISTS "Users can view templates" ON public.questionnaire_templates;

CREATE POLICY "Users can delete templates" 
ON public.questionnaire_templates 
FOR DELETE 
TO authenticated
USING (tenant_id = (
  SELECT profiles.tenant_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update templates" 
ON public.questionnaire_templates 
FOR UPDATE 
TO authenticated
USING (tenant_id = (
  SELECT profiles.tenant_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can view templates" 
ON public.questionnaire_templates 
FOR SELECT 
TO authenticated
USING (
  is_default = true 
  OR tenant_id = (
    SELECT profiles.tenant_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);