-- Create FAQ items table
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI suggestions table
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'no_return', 'positive_evolution', 'missed_appointments', 'pending_messages'
  priority INTEGER NOT NULL DEFAULT 1, -- 1=alta, 2=média, 3=baixa
  data JSONB NOT NULL DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for faq_items
CREATE POLICY "Authenticated users can view FAQ items from their tenant"
ON public.faq_items
FOR SELECT
USING (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can insert FAQ items to their tenant"
ON public.faq_items
FOR INSERT
WITH CHECK (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can update FAQ items from their tenant"
ON public.faq_items
FOR UPDATE
USING (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can delete FAQ items from their tenant"
ON public.faq_items
FOR DELETE
USING (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

-- Create RLS policies for ai_suggestions
CREATE POLICY "Authenticated users can view AI suggestions from their tenant"
ON public.ai_suggestions
FOR SELECT
USING (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can insert AI suggestions to their tenant"
ON public.ai_suggestions
FOR INSERT
WITH CHECK (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can update AI suggestions from their tenant"
ON public.ai_suggestions
FOR UPDATE
USING (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can delete AI suggestions from their tenant"
ON public.ai_suggestions
FOR DELETE
USING (tenant_id IN (
  SELECT p.tenant_id
  FROM profiles p
  WHERE p.user_id = auth.uid()
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_suggestions_updated_at
BEFORE UPDATE ON public.ai_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();