import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const [
      totalPacientes,
      pacientesActivos,
      turnosHoy,
      turnosSemana,
      ingresosMes,
      turnosPendientes,
      pagosPendientes,
      informesMes,
    ] = await Promise.all([
      db.paciente.count(),
      db.paciente.count({ where: { activo: true } }),
      db.turno.findMany({
        where: {
          fecha: { gte: today, lt: tomorrow },
          estado: { notIn: ['cancelado'] },
        },
        include: {
          paciente: { select: { nombre: true, apellido: true } },
        },
        orderBy: { fecha: 'asc' },
      }),
      db.turno.count({
        where: {
          fecha: { gte: startOfWeek, lte: endOfWeek },
          estado: { notIn: ['cancelado'] },
        },
      }),
      db.pago.aggregate({
        _sum: { monto: true },
        where: {
          estado: 'pagado',
          fechaPago: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      db.turno.count({
        where: { estado: 'pendiente' },
      }),
      db.pago.aggregate({
        _sum: { monto: true },
        where: { estado: 'pendiente' },
      }),
      db.informeClinico.count({
        where: {
          fecha: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ])

    const proximosTurnos = await db.turno.findMany({
      where: {
        fecha: { gte: today },
        estado: { notIn: ['cancelado', 'completado'] },
      },
      include: {
        paciente: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fecha: 'asc' },
      take: 10,
    })

    const pagosRecientes = await db.pago.findMany({
      where: { estado: 'pagado' },
      include: {
        paciente: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fechaPago: 'desc' },
      take: 5,
    })

    const ultimosInformes = await db.informeClinico.findMany({
      include: {
        paciente: { select: { nombre: true, apellido: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const turnosPorEstado = await db.turno.groupBy({
      by: ['estado'],
      _count: { estado: true },
    })

    const pagosPorMetodo = await db.pago.groupBy({
      by: ['metodo'],
      _sum: { monto: true },
      _count: { metodo: true },
      where: { estado: 'pagado' },
    })

    const ingresosPorDia = await db.pago.groupBy({
      by: ['fechaPago'],
      _sum: { monto: true },
      where: {
        estado: 'pagado',
        fechaPago: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { fechaPago: 'asc' },
    })

    return NextResponse.json({
      totalPacientes,
      pacientesActivos,
      turnosHoy,
      turnosSemanaCount: turnosSemana,
      ingresosMes: ingresosMes._sum.monto || 0,
      turnosPendientes,
      pagosPendientes: pagosPendientes._sum.monto || 0,
      informesMes,
      proximosTurnos,
      pagosRecientes,
      ultimosInformes,
      turnosPorEstado,
      pagosPorMetodo,
      ingresosPorDia,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
