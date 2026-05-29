import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Delete all data in reverse dependency order
    await db.informeClinico.deleteMany()
    await db.pago.deleteMany()
    await db.turno.deleteMany()
    await db.paciente.deleteMany()
    await db.configuracion.deleteMany()
    await db.usuario.deleteMany()

    return NextResponse.json({
      message: 'Todos los datos fueron eliminados exitosamente. Podés cargar datos nuevos o usar el botón de datos de ejemplo.',
    })
  } catch (error) {
    console.error('Error resetting database:', error)
    return NextResponse.json({ error: 'Error al eliminar los datos' }, { status: 500 })
  }
}
