import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Allow re-seeding by clearing existing data first
    await db.informeClinico.deleteMany()
    await db.pago.deleteMany()
    await db.turno.deleteMany()
    await db.paciente.deleteMany()
    await db.configuracion.deleteMany()

    // Seed admin user
    const existingAdmin = await db.usuario.findUnique({ where: { email: 'silvia@espaciosinter.com.ar' } })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Espacios2026!', 12)
      await db.usuario.create({
        data: {
          email: 'silvia@espaciosinter.com.ar',
          nombre: 'Lic. Silvia Hara',
          password: hashedPassword,
          rol: 'admin',
          activo: true,
        },
      })
    }

    const existingPacientes = 0

    const pacientes = await Promise.all([
      db.paciente.create({
        data: {
          nombre: 'María',
          apellido: 'González',
          email: 'maria.gonzalez@email.com',
          telefono: '11-4567-8901',
          fechaNacimiento: '1985-03-15',
          dni: '30456789',
          direccion: 'Av. Corrientes 1234, CABA',
          obraSocial: 'OSDE',
          numeroAfiliado: 'OSDE-210001',
          contactoEmergencia: 'Juan González - 11-5678-9012',
          notas: 'Paciente derivada por médico clínico. Presenta síntomas de ansiedad generalizada.',
        },
      }),
      db.paciente.create({
        data: {
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos.rodriguez@email.com',
          telefono: '11-2345-6789',
          fechaNacimiento: '1990-07-22',
          dni: '35678901',
          direccion: 'Av. Santa Fe 567, CABA',
          obraSocial: 'Swiss Medical',
          numeroAfiliado: 'SM-150002',
          contactoEmergencia: 'Ana Rodríguez - 11-6789-0123',
          notas: 'Consulta por problemas de pareja. Asiste con su esposa a sesiones conjuntas.',
        },
      }),
      db.paciente.create({
        data: {
          nombre: 'Luciana',
          apellido: 'Martínez',
          email: 'luciana.martinez@email.com',
          telefono: '11-3456-7890',
          fechaNacimiento: '1995-11-08',
          dni: '40123456',
          direccion: 'Recoleta, CABA',
          obraSocial: 'Galeno',
          numeroAfiliado: 'GAL-330003',
          contactoEmergencia: 'Silvia Martínez - 11-7890-1234',
          notas: 'Estudiante universitaria. Presenta estrés académico y síntomas depresivos leves.',
        },
      }),
      db.paciente.create({
        data: {
          nombre: 'Roberto',
          apellido: 'López',
          email: 'roberto.lopez@email.com',
          telefono: '11-5678-9012',
          fechaNacimiento: '1978-01-30',
          dni: '28901234',
          direccion: 'Palermo, CABA',
          obraSocial: null,
          numeroAfiliado: null,
          contactoEmergencia: 'Marta López - 11-8901-2345',
          notas: 'Particular. Consulta por duelo complicado tras pérdida de su padre.',
        },
      }),
      db.paciente.create({
        data: {
          nombre: 'Valentina',
          apellido: 'Fernández',
          email: 'valentina.fernandez@email.com',
          telefono: '11-6789-0123',
          fechaNacimiento: '2000-05-18',
          dni: '42345678',
          direccion: 'Caballito, CABA',
          obraSocial: 'IOMA',
          numeroAfiliado: 'IOMA-440005',
          contactoEmergencia: 'Pedro Fernández - 11-9012-3456',
          notas: 'Paciente joven con trastorno de ansiedad social. Terapia cognitivo-conductual.',
        },
      }),
      db.paciente.create({
        data: {
          nombre: 'Diego',
          apellido: 'Sánchez',
          email: 'diego.sanchez@email.com',
          telefono: '11-7890-1234',
          fechaNacimiento: '1982-09-12',
          dni: '31234567',
          direccion: 'Belgrano, CABA',
          obraSocial: 'OSDE',
          numeroAfiliado: 'OSDE-550006',
          contactoEmergencia: 'Laura Sánchez - 11-0123-4567',
          notas: 'Consulta por burnout y dificultades en la gestión del enojo.',
        },
      }),
    ])

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const turnosData = [
      { pacienteIdx: 0, daysOffset: 0, hour: 9, duracion: 60, modalidad: 'presencial', estado: 'confirmado', precio: 15000 },
      { pacienteIdx: 1, daysOffset: 0, hour: 10, duracion: 90, modalidad: 'presencial', estado: 'confirmado', precio: 20000 },
      { pacienteIdx: 2, daysOffset: 0, hour: 12, duracion: 60, modalidad: 'online', estado: 'pendiente', precio: 12000 },
      { pacienteIdx: 3, daysOffset: 1, hour: 9, duracion: 60, modalidad: 'presencial', estado: 'confirmado', precio: 15000 },
      { pacienteIdx: 4, daysOffset: 1, hour: 11, duracion: 60, modalidad: 'online', estado: 'pendiente', precio: 12000 },
      { pacienteIdx: 5, daysOffset: 1, hour: 15, duracion: 60, modalidad: 'presencial', estado: 'confirmado', precio: 15000 },
      { pacienteIdx: 0, daysOffset: 2, hour: 10, duracion: 60, modalidad: 'presencial', estado: 'pendiente', precio: 15000 },
      { pacienteIdx: 2, daysOffset: 3, hour: 9, duracion: 60, modalidad: 'online', estado: 'pendiente', precio: 12000 },
      { pacienteIdx: 3, daysOffset: 3, hour: 11, duracion: 60, modalidad: 'presencial', estado: 'pendiente', precio: 15000 },
      { pacienteIdx: 1, daysOffset: 4, hour: 10, duracion: 90, modalidad: 'presencial', estado: 'pendiente', precio: 20000 },
      { pacienteIdx: 5, daysOffset: 4, hour: 14, duracion: 60, modalidad: 'presencial', estado: 'pendiente', precio: 15000 },
      { pacienteIdx: 4, daysOffset: 5, hour: 9, duracion: 60, modalidad: 'online', estado: 'pendiente', precio: 12000 },
      { pacienteIdx: 0, daysOffset: -1, hour: 10, duracion: 60, modalidad: 'presencial', estado: 'completado', precio: 15000 },
      { pacienteIdx: 1, daysOffset: -2, hour: 10, duracion: 90, modalidad: 'presencial', estado: 'completado', precio: 20000 },
      { pacienteIdx: 3, daysOffset: -3, hour: 9, duracion: 60, modalidad: 'presencial', estado: 'completado', precio: 15000 },
      { pacienteIdx: 2, daysOffset: -4, hour: 12, duracion: 60, modalidad: 'online', estado: 'completado', precio: 12000 },
      { pacienteIdx: 5, daysOffset: -5, hour: 14, duracion: 60, modalidad: 'presencial', estado: 'cancelado', notas: 'Paciente canceló por enfermedad', precio: 15000 },
    ]

    const turnos = []
    for (const t of turnosData) {
      const fecha = new Date(today)
      fecha.setDate(fecha.getDate() + t.daysOffset)
      fecha.setHours(t.hour, 0, 0, 0)

      const turno = await db.turno.create({
        data: {
          pacienteId: pacientes[t.pacienteIdx].id,
          fecha,
          duracion: t.duracion,
          modalidad: t.modalidad,
          estado: t.estado,
          notas: t.notas || null,
          precio: t.precio,
        },
      })
      turnos.push(turno)
    }

    const informesData = [
      {
        pacienteIdx: 0,
        turnoIdx: 12,
        tipo: 'sesion',
        motivoConsulta: 'Ansiedad generalizada con síntomas somáticos',
        observaciones: 'La paciente refiere dificultad para conciliar el sueño, taquicardia y pensamientos catastróficos recurrentes. Se observa tensión muscular generalizada durante la sesión. Refiere que los síntomas se intensificaron en las últimas tres semanas.',
        diagnostico: 'Trastorno de Ansiedad Generalizada (F41.1)',
        planTratamiento: 'Terapia cognitivo-conductual con técnica de reestructuración cognitiva. Ejercicios de respiración diafragmática y relajación muscular progresiva. Frecuencia: semanal. Duración estimada: 16 sesiones.',
        evolucion: 'Buena receptividad al tratamiento. La paciente comprende el modelo cognitivo y ha comenzado a identificar pensamientos automáticos negativos. Se asignaron tareas de autoregistro.',
        firmado: true,
      },
      {
        pacienteIdx: 1,
        turnoIdx: 13,
        tipo: 'sesion',
        motivoConsulta: 'Conflictos en la relación de pareja',
        observaciones: 'La pareja presenta dificultades en la comunicación, con patrones de crítica y actitud defensiva. Ambos miembros expresan sentirse no escuchados. Se identifican ciclos de demanda-retiro en las interacciones.',
        diagnostico: 'Problemas relacionados con la relación de pareja (Z63.0)',
        planTratamiento: 'Terapia de pareja centrada en la comunicación emocional. Entrenamiento en escucha activa y expresión de necesidades. Frecuencia: quincenal. Duración estimada: 12 sesiones.',
        evolucion: 'Sesión inicial de evaluación. Se estableció el marco terapéutico y se identificaron las principales áreas de conflicto. Ambos miembros muestran disposición para trabajar en la relación.',
        firmado: true,
      },
      {
        pacienteIdx: 3,
        turnoIdx: 14,
        tipo: 'evaluacion',
        motivoConsulta: 'Duelo complicado tras el fallecimiento del padre',
        observaciones: 'El paciente perdió a su padre hace 8 meses. Presenta tristeza persistente, dificultad para retomar actividades cotidianas, sentimientos de culpa y problemas de concentración. Refiere aislamiento social progresivo.',
        diagnostico: 'Reacción de duelo prolongado (F43.81)',
        planTratamiento: 'Terapia centrada en el duelo con enfoque integrador. Procesamiento emocional de la pérdida, reconstrucción de significado y reintegración social gradual. Frecuencia: semanal. Reevaluación en 8 sesiones.',
        evolucion: 'Primera sesión de evaluación. El paciente muestra conciencia de su dificultad pero resistencia a procesar emociones asociadas a la pérdida. Se trabajará en la alianza terapéutica.',
        firmado: false,
      },
      {
        pacienteIdx: 2,
        turnoIdx: 15,
        tipo: 'seguimiento',
        motivoConsulta: 'Seguimiento de tratamiento por estrés académico',
        observaciones: 'La paciente reporta mejora en el manejo del estrés. Ha implementado técnicas de estudio y organización del tiempo. Persiste cierta ansiedad antes de exámenes pero de menor intensidad que al inicio del tratamiento.',
        diagnostico: 'Adaptación al estrés académico - en evolución favorable',
        planTratamiento: 'Continuar con el plan de tratamiento actual. Incorporar técnicas de exposición gradual para la ansiedad ante exámenes. Reducir frecuencia a quincenal.',
        evolucion: 'Evolución positiva. La paciente muestra mayor autonomía en el manejo de sus síntomas. Las técnicas de regulación emocional han sido incorporadas exitosamente. Se evalúa reducción de frecuencia.',
        firmado: true,
      },
    ]

    for (const inf of informesData) {
      const fechaInforme = new Date(today)
      fechaInforme.setDate(fechaInforme.getDate() + (inf.turnoIdx < turnos.length ? -Math.abs(inf.turnoIdx - 12) - 1 : 0))
      fechaInforme.setHours(10, 0, 0, 0)

      await db.informeClinico.create({
        data: {
          pacienteId: pacientes[inf.pacienteIdx].id,
          turnoId: inf.turnoIdx < turnos.length ? turnos[inf.turnoIdx].id : null,
          fecha: fechaInforme,
          tipo: inf.tipo,
          motivoConsulta: inf.motivoConsulta,
          observaciones: inf.observaciones,
          diagnostico: inf.diagnostico,
          planTratamiento: inf.planTratamiento,
          evolucion: inf.evolucion,
          firmado: inf.firmado,
        },
      })
    }

    const pagosData = [
      { pacienteIdx: 0, turnoIdx: 12, monto: 15000, metodo: 'mercadopago', estado: 'pagado', daysAgo: 1 },
      { pacienteIdx: 1, turnoIdx: 13, monto: 20000, metodo: 'transferencia', estado: 'pagado', daysAgo: 2 },
      { pacienteIdx: 3, turnoIdx: 14, monto: 15000, metodo: 'efectivo', estado: 'pagado', daysAgo: 3 },
      { pacienteIdx: 2, turnoIdx: 15, monto: 12000, metodo: 'debito', estado: 'pagado', daysAgo: 4 },
      { pacienteIdx: 0, turnoIdx: 0, monto: 15000, metodo: 'mercadopago', estado: 'pendiente', daysAgo: 0 },
      { pacienteIdx: 1, turnoIdx: 1, monto: 20000, metodo: 'credito', estado: 'pendiente', daysAgo: 0 },
      { pacienteIdx: 4, turnoIdx: 4, monto: 12000, metodo: 'transferencia', estado: 'pendiente', daysAgo: 0 },
      { pacienteIdx: 5, turnoIdx: 16, monto: 15000, metodo: 'efectivo', estado: 'reembolsado', daysAgo: 5 },
    ]

    for (const p of pagosData) {
      const fechaPago = p.estado === 'pagado' ? new Date(today) : null
      if (fechaPago) {
        fechaPago.setDate(fechaPago.getDate() - p.daysAgo)
      }

      await db.pago.create({
        data: {
          pacienteId: pacientes[p.pacienteIdx].id,
          turnoId: p.turnoIdx < turnos.length ? turnos[p.turnoIdx].id : null,
          monto: p.monto,
          metodo: p.metodo,
          estado: p.estado,
          referencia: p.metodo === 'mercadopago' ? `MP-${Date.now()}-${p.pacienteIdx}` : p.metodo === 'transferencia' ? `TB-${Date.now()}-${p.pacienteIdx}` : null,
          fechaPago,
        },
      })
    }

    await db.configuracion.createMany({
      data: [
        { clave: 'nombre_clinica', valor: 'Espacios Inter' },
        { clave: 'nombre_psicologa', valor: 'Lic. Silvia Hara' },
        { clave: 'telefono_clinica', valor: '11-5555-1234' },
        { clave: 'email_clinica', valor: 'contacto@espaciosinter.com.ar' },
        { clave: 'direccion_clinica', valor: 'Av. Las Heras 2456, Piso 3, Dpto B, CABA' },
        { clave: 'precio_sesion_presencial', valor: '15000' },
        { clave: 'precio_sesion_online', valor: '12000' },
        { clave: 'duracion_sesion', valor: '60' },
        { clave: 'metodos_pago', valor: 'efectivo,transferencia,mercadopago,debito,credito' },
      ],
    })

    return NextResponse.json({
      message: 'Base de datos poblada exitosamente',
      pacientes: pacientes.length,
      turnos: turnos.length,
      informes: informesData.length,
      pagos: pagosData.length,
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    const message = error instanceof Error ? error.message : 'Error al poblar la base de datos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
