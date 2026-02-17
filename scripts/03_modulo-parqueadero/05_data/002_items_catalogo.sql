insert into public.parq_items_catalogo (codigo, nombre, categoria, descripcion, orden) values
-- Niveles
('NIV_COMBUSTIBLE', 'Combustible', 'niveles', 'Nivel suficiente para la operación del turno, sin testigos de reserva encendidos', 10),
('NIV_ACEITE', 'Aceite motor', 'niveles', 'Nivel dentro del rango indicado en la varilla, sin presencia de fugas, VALIDAR CON TESTIGO', 11),
('NIV_REFRIGERANTE', 'Refrigerante', 'niveles', 'Nivel visible entre mínimo y máximo del depósito, sin fugas', 12),
('NIV_HIDRAULICO', 'Aceite hidráulico', 'niveles', 'Nivel correcto en el depósito, sin fugas ni ruidos anómalos', 14),

-- Luces
('LUZ_ALTAS', 'Luces altas', 'luces', 'Encendido correcto, iluminación adecuada', 20),
('LUZ_BAJAS', 'Luces bajas', 'luces', 'Encendido correcto, iluminación adecuada', 21),
('LUZ_POSICION', 'Luces de posición', 'luces', 'Funcionamiento correcto en parte delantera y trasera', 22),
('LUZ_FRENO', 'Luces de freno', 'luces', 'Se activan correctamente al accionar el pedal', 23),
('LUZ_DIR_DELANTERAS', 'Direccionales delanteras', 'luces', 'Funcionamiento sincronizado y visible', 24),
('LUZ_DIR_TRASERAS', 'Direccionales traseras', 'luces', 'Funcionamiento sincronizado y visible', 25),
('LUZ_DIR_LATERALES', 'Direccionales laterales', 'luces', 'Operativas cuando aplique', 26),
('LUZ_REVERSA', 'Luz de reversa', 'luces', 'Se activa al engranar reversa', 27),
('LUZ_BALIZA', 'Baliza giratoria', 'luces', 'Luz giratoria operativa para señalización de grúa', 28),
('LUZ_AUXILIAR', 'Luces auxiliares', 'luces', 'Luces de trabajo encendidas y funcionales', 29),
('LUZ_TESTIGOS', 'Testigos del tablero', 'luces', 'Sin alertas críticas encendidas, indicadores operativos', 30),

-- Exterior
('EXT_PLACAS', 'Placas del vehículo', 'exterior', 'Placas visibles, legibles y firmemente sujetas', 40),
('EXT_LLANTAS', 'Estado de llantas', 'exterior', 'Labrado adecuado, presión correcta y sin daños visibles', 41),
('EXT_RINES', 'Rines y tuercas', 'exterior', 'Rines sin fisuras, tuercas completas y ajustadas', 42),
('EXT_PARABRISAS', 'Parabrisas', 'exterior', 'Sin fisuras o daños que afecten la visibilidad', 43),
('EXT_VIDRIOS', 'Vidrios laterales', 'exterior', 'Vidrios completos, sin fisuras ni desprendimientos', 44),
('EXT_ESPEJO_IZQ', 'Espejo retrovisor izquierdo', 'exterior', 'Completo, firme y correctamente ajustado', 45),
('EXT_ESPEJO_DER', 'Espejo retrovisor derecho', 'exterior', 'Completo, firme y correctamente ajustado', 46),
('EXT_ESPEJO_INT', 'Espejo retrovisor interno', 'exterior', 'Completo y correctamente ajustado', 47),
('EXT_LIMPIAVIDRIOS', 'Limpiaparabrisas', 'exterior', 'Plumillas en buen estado, limpieza efectiva', 48),
('EXT_CARROCERIA', 'Estado carrocería', 'exterior', 'Sin daños estructurales ni elementos sueltos', 49),

-- Sistema de grúa
('GRU_PLATAFORMA', 'Plataforma de carga', 'grua', 'Estructura íntegra, sin grietas ni deformaciones', 50),
('GRU_CABLE', 'Cable de acero', 'grua', 'Sin hilos rotos, correctamente lubricado', 52),
('GRU_WINCHE', 'Winche', 'grua', 'Operación fluida, sin ruidos ni fallas', 53),
('GRU_GANCHO', 'Gancho del winche', 'grua', 'Con seguro funcional, sin deformaciones', 54),
('GRU_CADENAS', 'Cadenas de amarre', 'grua', 'Eslabones completos, sin desgaste crítico', 55),
('GRU_TACOS', 'Tacos de seguridad', 'grua', 'Mínimo cuatro unidades, en buen estado', 56),
('GRU_HIDRAULICO', 'Sistema hidráulico', 'grua', 'Sin fugas visibles ni pérdida de presión', 57),
('GRU_MANDOS', 'Mandos de operación', 'grua', 'Controles responden correctamente', 58),

-- Verificación funcional
('FUNC_MOTOR', 'Encendido del motor', 'funcional', 'Arranque normal, sin ruidos o vibraciones anómalas', 60),
('FUNC_FRENO_SERVICIO', 'Freno de servicio', 'funcional', 'Respuesta efectiva y uniforme', 61),
('FUNC_FRENO_PARQUEO', 'Freno de parqueo', 'funcional', 'Retiene el vehículo correctamente', 62),
('FUNC_PITO', 'Pito', 'funcional', 'Sonido audible y continuo', 63),
('FUNC_ALARMA_REV', 'Alarma de reversa', 'funcional', 'Se activa automáticamente al engranar reversa', 64),
('FUNC_DIRECCION', 'Dirección', 'funcional', 'Respuesta precisa, sin juego excesivo', 65),
('FUNC_CINTURON', 'Cinturón de seguridad', 'funcional', 'Sistema funcional, con anclaje seguro', 66),

-- Kit de carretera
('KIT_EXTINTOR', 'Extintor', 'kit_carretera', 'Extintor mínimo 10 lb, carga vigente y accesible', 70),
('KIT_BOTIQUIN', 'Botiquín', 'kit_carretera', 'Completo conforme a normativa vigente', 71),
('KIT_CONOS', 'Conos de señalización', 'kit_carretera', 'Mínimo cuatro unidades en buen estado', 72),
('KIT_LLANTA', 'Llanta de repuesto', 'kit_carretera', 'Llanta en buen estado, con presión adecuada', 73),

-- EPP Operador
('EPP_OP_CAMISA', 'Camisa manga larga', 'epp_operador', 'Camisa de dotación en buen estado', 80),
('EPP_OP_PANTALON', 'Pantalón de trabajo', 'epp_operador', 'Pantalón resistente, sin roturas', 81),
('EPP_OP_BOTAS', 'Botas punta de acero', 'epp_operador', 'Botas con puntera reforzada y suela en buen estado', 82),
('EPP_OP_BOTAS_CAUCHO', 'Botas pantaneras', 'epp_operador', 'Botas impermeables en buen estado', 83),
('EPP_OP_GUANTES', 'Guantes de carnaza', 'epp_operador', 'Guantes íntegros, sin roturas', 84),
('EPP_OP_IMPERMEABLE', 'Capa de lluvia', 'epp_operador', 'Impermeable funcional y completo', 85),
('EPP_OP_GORRA', 'Gorra con cobertor de nuca', 'epp_operador', 'Protección solar en buen estado', 86),

-- EPP Auxiliar
('EPP_AUX_CAMISA', 'Camisa manga larga', 'epp_auxiliar', 'Camisa de dotación en buen estado', 90),
('EPP_AUX_PANTALON', 'Pantalón de trabajo', 'epp_auxiliar', 'Pantalón resistente, sin roturas', 91),
('EPP_AUX_BOTAS', 'Botas punta de acero', 'epp_auxiliar', 'Botas con puntera reforzada y suela en buen estado', 92),
('EPP_AUX_BOTAS_CAUCHO', 'Botas pantaneras', 'epp_auxiliar', 'Botas impermeables en buen estado', 93),
('EPP_AUX_GUANTES', 'Guantes de carnaza', 'epp_auxiliar', 'Guantes íntegros, sin roturas', 94),
('EPP_AUX_IMPERMEABLE', 'Capa de lluvia', 'epp_auxiliar', 'Impermeable funcional y completo', 95),
('EPP_AUX_GORRA', 'Gorra con cobertor de nuca', 'epp_auxiliar', 'Protección solar en buen estado', 96)

on conflict (codigo) do update set
  nombre = excluded.nombre,
  categoria = excluded.categoria,
  descripcion = excluded.descripcion,
  orden = excluded.orden,
  actualizado_en = now();
