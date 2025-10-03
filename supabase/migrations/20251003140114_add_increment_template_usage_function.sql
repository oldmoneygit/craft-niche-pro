/*
  # Add increment_template_usage function

  1. New Functions
    - `increment_template_usage(template_id UUID)` - Increments the times_used counter for a template
  
  2. Purpose
    - Track how many times a template has been used to create meal plans
    - Helps identify popular templates
  
  3. Security
    - SECURITY DEFINER allows authenticated users to update the counter
*/

CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE meal_plan_templates
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE id = template_id;
END;
$$;