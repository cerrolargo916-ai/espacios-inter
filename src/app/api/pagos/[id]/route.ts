import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.estado !== undefined) data.estado = body.estado
    if (body.metodo !== undefined) data.metodo = body.metodo
    if (body.referencia !== undefined) data.referencia = body.referencia
    if (body.fechaPago !== undefined) data.fechaPago = new Date(body.fechaPago)
    if (body.monto !== undefined) data.monto = body.monto

    const pago = await db.pago.update({
      where: { id },
      data,
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(pago)
  } catch (error) {
    console.error('Error updating pago:', error)
    return NextResponse.json({ error: 'Error al actualizar pago' }, { status: 500 })
  }
}
