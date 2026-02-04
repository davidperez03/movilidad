insert into public.parq_items_catalogo (codigo, nombre, categoria, descripcion, orden) values
-- Niveles
('NIV_COMBUSTIBLE', 'Combustible', 'niveles', 'Tanque con nivel suficiente', 10),
('NIV_ACEITE', 'Aceite motor', 'niveles', 'Verificar con varilla', 11),
('NIV_REFRIGERANTE', 'Refrigerante', 'niveles', 'Nivel visible en depósito', 12),
('NIV_FRENOS', 'Líquido de frenos', 'niveles', 'Nivel visible en depósito', 13),
('NIV_HIDRAULICO', 'Aceite hidráulico', 'niveles', 'Nivel en depósito', 14),

-- Luces
('LUZ_ALTAS', 'Luces altas', 'luces', 'Funcionando correctamente', 20),
('LUZ_BAJAS', 'Luces bajas', 'luces', 'Funcionando correctamente', 21),
('LUZ_POSICION', 'Luces de posición', 'luces', 'Delanteras y traseras', 22),
('LUZ_FRENO', 'Luces de freno', 'luces', 'Funcionando al pisar', 23),
('LUZ_DIR_DELANTERAS', 'Direccionales delanteras', 'luces', 'Funcionando correctamente', 24),
('LUZ_DIR_TRASERAS', 'Direccionales traseras', 'luces', 'Funcionando correctamente', 25),
('LUZ_DIR_LATERALES', 'Direccionales laterales', 'luces', 'Si aplica', 26),
('LUZ_REVERSA', 'Luz de reversa', 'luces', 'Funcionando al engranar', 27),
('LUZ_BALIZA', 'Baliza giratoria', 'luces', 'Luz giratoria de grúa operativa', 28),
('LUZ_AUXILIAR', 'Luces auxiliares', 'luces', 'Luces de trabajo operativas', 29),
('LUZ_TESTIGOS', 'Testigos del tablero', 'luces', 'Sin alertas activas, indicadores funcionando', 30),

-- Exterior
('EXT_PLACAS', 'Placas del vehículo', 'exterior', 'Visibles y legibles', 40),
('EXT_LLANTAS', 'Estado de llantas', 'exterior', 'Labrado y presión correctos', 41),
('EXT_RINES', 'Rines y tuercas', 'exterior', 'Sin fisuras, tuercas completas', 42),
('EXT_PARABRISAS', 'Parabrisas', 'exterior', 'Sin fisuras que afecten visibilidad', 43),
('EXT_VIDRIOS', 'Vidrios laterales', 'exterior', 'Sin fisuras', 44),
('EXT_ESPEJO_IZQ', 'Espejo retrovisor izquierdo', 'exterior', 'Completo y ajustado', 45),
('EXT_ESPEJO_DER', 'Espejo retrovisor derecho', 'exterior', 'Completo y ajustado', 46),
('EXT_ESPEJO_INT', 'Espejo retrovisor interno', 'exterior', 'Completo y ajustado', 47),
('EXT_LIMPIAVIDRIOS', 'Limpiaparabrisas', 'exterior', 'Plumillas en buen estado', 48),
('EXT_CARROCERIA', 'Estado carrocería', 'exterior', 'Sin daños significativos', 49),

-- Sistema de grúa
('GRU_PLATAFORMA', 'Plataforma de carga', 'grua', 'Sin grietas ni deformaciones', 50),
('GRU_RAMPAS', 'Rampas de acceso', 'grua', 'Antideslizantes, bisagras firmes', 51),
('GRU_CABLE', 'Cable de acero', 'grua', 'Sin hilos rotos, lubricado', 52),
('GRU_WINCHE', 'Winche', 'grua', 'Funcionando correctamente', 53),
('GRU_GANCHO', 'Gancho del winche', 'grua', 'Con seguro, sin deformaciones', 54),
('GRU_CADENAS', 'Cadenas de amarre', 'grua', 'Eslabones completos', 55),
('GRU_TACOS', 'Tacos de seguridad', 'grua', 'Mínimo 4 unidades, en buen estado', 56),
('GRU_HIDRAULICO', 'Sistema hidráulico', 'grua', 'Sin fugas visibles', 57),
('GRU_MANDOS', 'Mandos de operación', 'grua', 'Controles responden', 58),

-- Verificación funcional
('FUNC_MOTOR', 'Encendido del motor', 'funcional', 'Sin ruidos anormales', 60),
('FUNC_FRENO_SERVICIO', 'Freno de servicio', 'funcional', 'Funcionando correctamente', 61),
('FUNC_FRENO_PARQUEO', 'Freno de parqueo', 'funcional', 'Funcionando correctamente', 62),
('FUNC_PITO', 'Pito', 'funcional', 'Sonido audible', 63),
('FUNC_ALARMA_REV', 'Alarma de reversa', 'funcional', 'Suena al engranar', 64),
('FUNC_DIRECCION', 'Dirección', 'funcional', 'Sin juego excesivo', 65),
('FUNC_CINTURON', 'Cinturón de seguridad', 'funcional', 'Funcionando correctamente', 66),

-- Kit de carretera
('KIT_EXTINTOR', 'Extintor', 'kit_carretera', 'Mínimo 10 lb, carga vigente', 70),
('KIT_BOTIQUIN', 'Botiquín', 'kit_carretera', 'Completo según norma', 71),
('KIT_CONOS', 'Conos de señalización', 'kit_carretera', 'Mínimo 4 unidades', 72),
('KIT_LLANTA', 'Llanta de repuesto', 'kit_carretera', 'En buen estado, con aire y labrado correspondiente', 73),

-- EPP Operador
('EPP_OP_CAMISA', 'Camisa manga larga', 'epp_operador', 'Camisa dotación', 80),
('EPP_OP_PANTALON', 'Pantalón de trabajo', 'epp_operador', 'Jean industrial', 81),
('EPP_OP_BOTAS', 'Botas punta de acero', 'epp_operador', 'Con puntera reforzada', 82),
('EPP_OP_BOTAS_CAUCHO', 'Botas pantaneras', 'epp_operador', 'Impermeables', 83),
('EPP_OP_GUANTES', 'Guantes de carnaza', 'epp_operador', 'Guantes de vaqueta', 84),
('EPP_OP_IMPERMEABLE', 'Capa de lluvia', 'epp_operador', 'Traje impermeable', 85),
('EPP_OP_GORRA', 'Gorra con cobertor de nuca', 'epp_operador', 'Protección solar', 86),

-- EPP Auxiliar
('EPP_AUX_CAMISA', 'Camisa manga larga', 'epp_auxiliar', 'Camisa dotación', 90),
('EPP_AUX_PANTALON', 'Pantalón de trabajo', 'epp_auxiliar', 'Jean industrial', 91),
('EPP_AUX_BOTAS', 'Botas punta de acero', 'epp_auxiliar', 'Con puntera reforzada', 92),
('EPP_AUX_BOTAS_CAUCHO', 'Botas pantaneras', 'epp_auxiliar', 'Impermeables', 93),
('EPP_AUX_GUANTES', 'Guantes de carnaza', 'epp_auxiliar', 'Guantes de vaqueta', 94),
('EPP_AUX_IMPERMEABLE', 'Capa de lluvia', 'epp_auxiliar', 'Traje impermeable', 95),
('EPP_AUX_GORRA', 'Gorra con cobertor de nuca', 'epp_auxiliar', 'Protección solar', 96)

on conflict (codigo) do update set
  nombre = excluded.nombre,
  categoria = excluded.categoria,
  descripcion = excluded.descripcion,
  orden = excluded.orden,
  actualizado_en = now();
