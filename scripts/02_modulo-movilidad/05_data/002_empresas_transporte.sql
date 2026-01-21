INSERT INTO public.mov_empresas_transporte (nombre) VALUES
  ('INTERRAPIDISIMO')
ON CONFLICT (nombre) DO NOTHING;
