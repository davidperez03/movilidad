import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"
import { consultaLimiter } from "@/lib/rate-limit"

const schema = z.object({
  placa: z.string().trim().toUpperCase().min(4).max(10),
})

function getClientIp(request: Request): string {
  const vercelIp = request.headers.get('x-vercel-forwarded-for')
  if (vercelIp) return vercelIp.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { allowed, retryAfter } = consultaLimiter.check(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta mas tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Placa inválida" },
      { status: 400 }
    )
  }

  try {
    // Cliente anon sin cookies — la RPC tiene GRANT EXECUTE TO anon
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.rpc("consultar_vehiculo_por_placa", {
      p_placa: parsed.data.placa,
    })

    if (error) {
      logger.error("consulta_publica_rpc_error", { error })
      return NextResponse.json(
        { error: "No fue posible consultar el trámite" },
        { status: 500 }
      )
    }

    const item = Array.isArray(data) ? data[0] : data
    if (!item) {
      // Verificar si la placa existe pero no tiene procesos
      const { data: cuenta } = await supabase
        .from("mov_cuentas_vehiculos")
        .select("placa")
        .eq("placa", parsed.data.placa)
        .maybeSingle()

      if (cuenta) {
        return NextResponse.json(
          { error: "El vehículo está registrado pero no tiene trámites en curso ni completados" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "No se encontró ningún vehículo con la placa " + parsed.data.placa },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: item })
  } catch (err) {
    logger.error("consulta_publica_error", { error: String(err) })
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
