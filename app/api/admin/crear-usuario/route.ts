import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const crearUsuarioSchema = z.object({
  email: z.string().min(1, 'Email requerido').email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Requiere una mayúscula')
    .regex(/[a-z]/, 'Requiere una minúscula')
    .regex(/[0-9]/, 'Requiere un número'),
  nombreCompleto: z.string().min(3).max(100).optional().default('')
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol_global')
      .eq('id', user.id)
      .single();

    if (perfil?.rol_global !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const validacion = crearUsuarioSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json({
        error: 'Datos inválidos',
        detalles: validacion.error.errors.map(e => e.message)
      }, { status: 400 });
    }

    const { email, password, nombreCompleto } = validacion.data;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre_completo: nombreCompleto, rol_global: 'usuario' }
    });

    if (createError) {
      const status = createError.message.includes('already registered') ? 409 : 400;
      return NextResponse.json({ error: createError.message }, { status });
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.user?.id, email: newUser.user?.email }
    });

  } catch (error) {
    logger.error('Error en crear-usuario', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
