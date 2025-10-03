/*
  # Add template tracking to meal plans

  1. Changes
    - Add `template_id` column to meal_plans table (if table exists)
    - Add `usage_count` column to meal_plan_templates (if table exists)
    - Create function to increment template usage counter

  2. Purpose
    - Track which template was used to create each meal plan
    - Count template usage for analytics
*/

-- Add template_id to meal_plans if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'meal_plans'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'meal_plans' 
      AND column_name = 'template_id'
    ) THEN
      ALTER TABLE public.meal_plans 
      ADD COLUMN template_id UUID REFERENCES public.meal_plan_templates(id) ON DELETE SET NULL;
      
      CREATE INDEX IF NOT EXISTS idx_meal_plans_template_id 
      ON public.meal_plans(template_id);
    END IF;
  END IF;
END $$;

-- Add usage_count to meal_plan_templates if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'meal_plan_templates'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'meal_plan_templates' 
      AND column_name = 'usage_count'
    ) THEN
      ALTER TABLE public.meal_plan_templates 
      ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Create or replace function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.meal_plan_templates
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_template_usage TO authenticated;