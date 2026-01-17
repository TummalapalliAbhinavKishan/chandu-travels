-- Add order_number to bookings table
ALTER TABLE public.bookings 
ADD COLUMN order_number TEXT UNIQUE;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers for new bookings
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_set_order_number
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Update existing bookings to have order numbers
UPDATE public.bookings 
SET order_number = generate_order_number() 
WHERE order_number IS NULL;

-- Create driver_locations table for real-time GPS tracking
CREATE TABLE public.driver_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on driver_locations
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view driver locations (for tracking)
CREATE POLICY "Anyone can view driver locations"
ON public.driver_locations
FOR SELECT
USING (true);

-- Only admins can insert/update driver locations
CREATE POLICY "Admins can insert driver locations"
ON public.driver_locations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update driver locations"
ON public.driver_locations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for driver_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Create index for better query performance
CREATE INDEX idx_driver_locations_booking_id ON public.driver_locations(booking_id);
CREATE INDEX idx_bookings_order_number ON public.bookings(order_number);