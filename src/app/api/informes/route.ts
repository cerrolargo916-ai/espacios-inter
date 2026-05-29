import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pacienteId = searchParams.get('pacienteId')
    const tipo = searchParams.get('tipo')

    const where: Record<string, unknown> = {}

    if (pacienteId) {
      where.pacienteId = pacienteId
    }

    if (tipo) {
      where.tipo = tipo
    }

    const informes = await db.informeClinico.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
        turno: {
          select: { id: true, fecha: true },
        },
      },
    })

    return NextResponse.json(informes)
  } catch (error) {
    console.error('Error fetching informes:', error)
    return NextResponse.json({ error: 'Error al obtener informes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const informe = await db.informeClinico.create({
      data: {
        pacienteId: body.pacienteId,
        turnoId: body.turnoId || null,
        fecha: body.fecha ? new Date(body.fecha) : new Date(),
        tipo: body.tipo || 'sesion',
        motivoConsulta: body.motivoConsulta || null,
        observaciones: body.observaciones || null,
        diagnostico: body.diagnostico || null,
        planTratamiento: body.planTratamiento || null,
        evolucion: body.evolucion || null,
        firmado: body.firmado || false,
      },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(informe, { status: 201 })
  } catch (error) {
    console.error('Error creating informe:', error)
    return NextResponse.json({ error: 'Error al crear informe' }, { status: 500 })
  }
}
