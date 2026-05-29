import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const turno = await db.turno.findUnique({
      where: { id },
      include: {
        paciente: true,
        informes: true,
        pagos: true,
      },
    })

    if (!turno) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }

    return NextResponse.json(turno)
  } catch (error) {
    console.error('Error fetching turno:', error)
    return NextResponse.json({ error: 'Error al obtener turno' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.fecha !== undefined) data.fecha = new Date(body.fecha)
    if (body.duracion !== undefined) data.duracion = body.duracion
    if (body.modalidad !== undefined) data.modalidad = body.modalidad
    if (body.estado !== undefined) data.estado = body.estado
    if (body.notas !== undefined) data.notas = body.notas
    if (body.precio !== undefined) data.precio = body.precio

    const turno = await db.turno.update({
      where: { id },
      data,
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(turno)
  } catch (error) {
    console.error('Error updating turno:', error)
    return NextResponse.json({ error: 'Error al actualizar turno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const turno = await db.turno.update({
      where: { id },
      data: { estado: 'cancelado' },
    })

    return NextResponse.json(turno)
  } catch (error) {
    console.error('Error cancelling turno:', error)
    return NextResponse.json({ error: 'Error al cancelar turno' }, { status: 500 })
  }
}
