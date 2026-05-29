import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const configs = await db.configuracion.findMany()
    const configMap: Record<string, string> = {}
    for (const c of configs) {
      configMap[c.clave] = c.valor
    }
    return NextResponse.json(configMap)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>

    const updates = Object.entries(body).map(([clave, valor]) =>
      db.configuracion.upsert({
        where: { clave },
        update: { valor },
        create: { clave, valor },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ message: 'Configuración guardada exitosamente' })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
