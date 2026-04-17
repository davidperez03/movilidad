-- Datos iniciales: insumos de parqueadero
-- Ejecutar después de 001_inv_insumos.sql y 002_inv_stock.sql

INSERT INTO public.inv_insumos (nombre, categoria, unidad, stock_minimo, tipo_tracking, modulo)
VALUES
  ('Libreta Carro',         'libretas', 'hoja', 200, 'ubicacion', 'parqueadero'),
  ('Libreta Moto',          'libretas', 'hoja', 200, 'ubicacion', 'parqueadero'),
  ('Sello de Seguridad',    'sellos',   'und',  300, 'ubicacion', 'parqueadero'),
  ('Sticker de Inventario', 'stickers', 'und',  200, 'rango',     'parqueadero')
ON CONFLICT DO NOTHING;

-- Stock inicial en bodega = 0 para los ítems de tipo ubicacion
-- (el equipo cargará las cantidades reales al activar el módulo)
INSERT INTO public.inv_stock (item_id, modulo, ubicacion, cantidad)
SELECT id, 'parqueadero', 'bodega', 0
FROM   public.inv_insumos
WHERE  modulo        = 'parqueadero'
AND    tipo_tracking = 'ubicacion'
ON CONFLICT DO NOTHING;

-- NOTA: inv_rangos para el Sticker de Inventario se crea manualmente
-- con el rango real una vez activado el módulo:
-- INSERT INTO public.inv_rangos (item_id, rango_inicio, rango_fin, usados)
-- SELECT id, 1, <rango_fin_real>, <usados_real>
-- FROM public.inv_insumos WHERE nombre = 'Sticker de Inventario' AND modulo = 'parqueadero';
