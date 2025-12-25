-- Create tables table
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  table_number VARCHAR(50) NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  qr_code_url TEXT,
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT tables_pkey PRIMARY KEY (id),
  CONSTRAINT tables_status_check CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance'))
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS tables_updated_at ON public.tables;
CREATE TRIGGER tables_updated_at
BEFORE UPDATE ON public.tables
FOR EACH ROW
EXECUTE FUNCTION update_tables_updated_at();

-- Disable RLS for development (enable in production with proper policies)
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;

-- Insert sample tables
INSERT INTO public.tables (table_number, capacity, location, status) VALUES
('T-01', 4, 'Main Hall', 'available'),
('T-02', 2, 'Main Hall', 'available'),
('T-03', 6, 'Main Hall', 'available'),
('T-04', 4, 'Window Side', 'available'),
('T-05', 2, 'Window Side', 'available'),
('T-06', 8, 'Private Room', 'available')
ON CONFLICT (table_number) DO NOTHING;
