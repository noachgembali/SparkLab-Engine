-- Create engine_connections table
CREATE TABLE public.engine_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  engine_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected',
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, engine_key)
);

-- Enable Row Level Security
ALTER TABLE public.engine_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own engine connections"
  ON public.engine_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engine connections"
  ON public.engine_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own engine connections"
  ON public.engine_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_engine_connections_updated_at
  BEFORE UPDATE ON public.engine_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();