import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const activo = searchParams.get('activo')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { apellido: { contains: search } },
        { email: { contains: search } },
        { dni: { contains: search } },
      ]
    }

    if (activo !== null && activo !== undefined && activo !== '') {
      where.activo = activo === 'true'
    }

    const pacientes = await db.paciente.findMany({
      where,
      orderBy: { apellido: 'asc' },
      include: {
        _count: {
          select: { turnos: true, informes: true, pagos: true },
        },
      },
    })

    return NextResponse.json(pacientes)
  } catch (error) {
    console.error('Error fetching pacientes:', error)
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const paciente = await db.paciente.create({
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
        activo: body.activo !== undefined ? body.activo : true,
      },
    })

    return NextResponse.json(paciente, { status: 201 })
  } catch (error) {
    console.error('Error creating paciente:', error)
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 })
  }
}
