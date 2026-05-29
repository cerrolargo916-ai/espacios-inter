import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const informe = await db.informeClinico.findUnique({
      where: { id },
      include: {
        paciente: true,
        turno: true,
      },
    })

    if (!informe) {
      return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 })
    }

    return NextResponse.json(informe)
  } catch (error) {
    console.error('Error fetching informe:', error)
    return NextResponse.json({ error: 'Error al obtener informe' }, { status: 500 })
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
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.motivoConsulta !== undefined) data.motivoConsulta = body.motivoConsulta
    if (body.observaciones !== undefined) data.observaciones = body.observaciones
    if (body.diagnostico !== undefined) data.diagnostico = body.diagnostico
    if (body.planTratamiento !== undefined) data.planTratamiento = body.planTratamiento
    if (body.evolucion !== undefined) data.evolucion = body.evolucion
    if (body.firmado !== undefined) data.firmado = body.firmado
    if (body.turnoId !== undefined) data.turnoId = body.turnoId
    if (body.fecha !== undefined) data.fecha = new Date(body.fecha)

    const informe = await db.informeClinico.update({
      where: { id },
      data,
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(informe)
  } catch (error) {
    console.error('Error updating informe:', error)
    return NextResponse.json({ error: 'Error al actualizar informe' }, { status: 500 })
  }
}
