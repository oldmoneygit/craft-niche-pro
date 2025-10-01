-- Atualizar função ensure_single_active_plan com search_path seguro
CREATE OR REPLACE FUNCTION ensure_single_active_plan()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.active = true THEN
    UPDATE meal_plans 
    SET active = false 
    WHERE client_id = NEW.client_id 
      AND id != NEW.id 
      AND active = true;
  END IF;
  RETURN NEW;
END;
$$;