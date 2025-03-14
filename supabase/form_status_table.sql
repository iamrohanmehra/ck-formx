-- Create the form_status table
CREATE TABLE IF NOT EXISTS public.form_status (
  id SERIAL PRIMARY KEY,
  form_type TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add initial records for existing forms
INSERT INTO public.form_status (form_type, is_active)
VALUES ('formx1', true), ('formx4', true)
ON CONFLICT (form_type) DO NOTHING;

-- Grant access to the table
ALTER TABLE public.form_status ENABLE ROW LEVEL SECURITY;

-- Create policies for the table
CREATE POLICY "Enable read access for all users" ON public.form_status
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.form_status
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.form_status
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add a comment to the table
COMMENT ON TABLE public.form_status IS 'Table to store the active status of forms'; 