-- Fix search_path for generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_number TEXT;
  order_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric order number
    new_order_number := 'ORD-' || upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if this order number already exists
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE order_number = new_order_number) INTO order_exists;
    
    -- If it doesn't exist, we can use it
    EXIT WHEN NOT order_exists;
  END LOOP;
  
  RETURN new_order_number;
END;
$$;

-- Fix search_path for set_order_number function
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;