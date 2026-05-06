-- Eliminación del índice único para permitir duplicados en los registros de NUNC
DROP INDEX IF EXISTS idx_nunc_registros_nunc_unico;