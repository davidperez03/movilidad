import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

const schema = z.object({
  placa: z.string().trim().toUpperCase().min(4).max(10),
})

export async function POST(req: Request) {
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
      return NextResponse.json(
        { error: "No se encontró ningún vehículo con esa placa" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: item })
  } catch (err) {
    console.error("consulta_publica_error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
