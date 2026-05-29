import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const paciente = await db.paciente.findUnique({
      where: { id },
      include: {
        turnos: {
          orderBy: { fecha: 'desc' },
          include: { informes: true, pagos: true },
        },
        informes: {
          orderBy: { fecha: 'desc' },
        },
        pagos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(paciente)
  } catch (error) {
    console.error('Error fetching paciente:', error)
    return NextResponse.json({ error: 'Error al obtener paciente' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const paciente = await db.paciente.update({
      where: { id },
      data: {
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        telefono: body.telefono || null,
        fechaNacimiento: body.fechaNacimiento || null,
        dni: body.dni || null,
        direccion: body.direccion || null,
        obraSocial: body.obraSocial || null,
        numeroAfiliado: body.numeroAfiliado || null,
        contactoEmergencia: body.contactoEmergencia || null,
        notas: body.notas || null,
        activo: body.activo !== undefined ? body.activo : undefined,
      },
    })

    return NextResponse.json(paciente)
  } catch (error) {
    console.error('Error updating paciente:', error)
    return NextResponse.json({ error: 'Error al actualizar paciente' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const paciente = await db.paciente.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json(paciente)
  } catch (error) {
    console.error('Error deactivating paciente:', error)
    return NextResponse.json({ error: 'Error al desactivar paciente' }, { status: 500 })
  }
}
