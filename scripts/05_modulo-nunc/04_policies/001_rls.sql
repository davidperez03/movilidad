-- nunc_sesiones y nunc_registros tienen RLS en 01_tables/001_tablas_nunc.sql

-- Historial: solo lectura para autenticados (inserciones vía triggers SECURITY DEFINER)
CREATE POLICY "nunc_historial_select_auth"
  ON public.nunc_historial_acciones FOR SELECT
  TO authenticated USING (true);
