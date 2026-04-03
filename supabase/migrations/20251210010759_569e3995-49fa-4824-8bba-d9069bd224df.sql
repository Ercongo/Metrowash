-- Create table for business hours
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for bookings/appointments
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  service_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for business hours (everyone can see schedule)
CREATE POLICY "Business hours are viewable by everyone" 
ON public.business_hours 
FOR SELECT 
USING (true);

-- Public read access for bookings (to show occupied slots)
CREATE POLICY "Bookings are viewable by everyone" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Allow anyone to create bookings (no auth required for customers)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

-- Insert default business hours (Monday to Saturday, 8:00 - 20:00)
INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_open) VALUES
(1, '08:00', '20:00', true),  -- Monday
(2, '08:00', '20:00', true),  -- Tuesday
(3, '08:00', '20:00', true),  -- Wednesday
(4, '08:00', '20:00', true),  -- Thursday
(5, '08:00', '20:00', true),  -- Friday
(6, '09:00', '18:00', true),  -- Saturday
(0, '00:00', '00:00', false); -- Sunday (closed)

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;