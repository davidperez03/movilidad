-- El trigger de inmutabilidad en nunc_historial_acciones bloquea todo UPDATE,
-- incluyendo los CASCADE SET NULL que disparan las FKs ON DELETE SET NULL cuando
-- se elimina un nunc_registro o una nunc_sesion. Esto impedía borrar ambos.
-- Solución: eliminar ambos FK constraints. sesion_id y registro_id quedan como
-- soft references (UUID sin FK). Los datos se preservan en los campos y en detalles.

ALTER TABLE public.nunc_historial_acciones
  DROP CONSTRAINT IF EXISTS nunc_historial_acciones_registro_id_fkey;

ALTER TABLE public.nunc_historial_acciones
  DROP CONSTRAINT IF EXISTS nunc_historial_acciones_sesion_id_fkey;
