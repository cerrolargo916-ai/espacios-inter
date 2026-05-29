import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const pacienteId = searchParams.get('pacienteId')

    const where: Record<string, unknown> = {}

    if (estado) {
      where.estado = estado
    }

    if (pacienteId) {
      where.pacienteId = pacienteId
    }

    if (fechaDesde || fechaHasta) {
      const fechaFilter: Record<string, unknown> = {}
      if (fechaDesde) fechaFilter.gte = new Date(fechaDesde)
      if (fechaHasta) fechaFilter.lte = new Date(fechaHasta)
      where.fecha = fechaFilter
    }

    const turnos = await db.turno.findMany({
      where,
      orderBy: { fecha: 'asc' },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true, email: true, telefono: true },
        },
      },
    })

    return NextResponse.json(turnos)
  } catch (error) {
    console.error('Error fetching turnos:', error)
    return NextResponse.json({ error: 'Error al obtener turnos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const turno = await db.turno.create({
      data: {
        pacienteId: body.pacienteId,
        fecha: new Date(body.fecha),
        duracion: body.duracion || 60,
        modalidad: body.modalidad || 'presencial',
        estado: body.estado || 'pendiente',
        notas: body.notas || null,
        precio: body.precio || null,
      },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(turno, { status: 201 })
  } catch (error) {
    console.error('Error creating turno:', error)
    return NextResponse.json({ error: 'Error al crear turno' }, { status: 500 })
  }
}
