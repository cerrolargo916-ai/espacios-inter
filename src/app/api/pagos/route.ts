import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado')
    const pacienteId = searchParams.get('pacienteId')
    const metodo = searchParams.get('metodo')

    const where: Record<string, unknown> = {}

    if (estado) {
      where.estado = estado
    }

    if (pacienteId) {
      where.pacienteId = pacienteId
    }

    if (metodo) {
      where.metodo = metodo
    }

    const pagos = await db.pago.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
        turno: {
          select: { id: true, fecha: true },
        },
      },
    })

    return NextResponse.json(pagos)
  } catch (error) {
    console.error('Error fetching pagos:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const pago = await db.pago.create({
      data: {
        pacienteId: body.pacienteId,
        turnoId: body.turnoId || null,
        monto: body.monto,
        metodo: body.metodo || 'efectivo',
        estado: body.estado || 'pendiente',
        referencia: body.referencia || null,
        fechaPago: body.fechaPago ? new Date(body.fechaPago) : null,
      },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(pago, { status: 201 })
  } catch (error) {
    console.error('Error creating pago:', error)
    return NextResponse.json({ error: 'Error al crear pago' }, { status: 500 })
  }
}
