// DSM-5 Diagnósticos — Categorías principales con códigos CIE-10
// Usados en la práctica clínica psicológica

export interface DiagnosticoDSM5 {
  codigo: string
  nombre: string
  categoria: string
}

export const CATEGORIAS_DSM5 = [
  'Trastornos del Neurodesarrollo',
  'Trastornos Depresivos',
  'Trastornos de Ansiedad',
  'Trastornos Obsesivo-Compulsivos y Relacionados',
  'Trastornos Relacionados con Traumas y Factores de Estrés',
  'Trastornos Disociativos',
  'Trastornos de Síntomas Somáticos y Relacionados',
  'Trastornos de la Conducta Alimentaria',
  'Trastornos de la Personalidad',
  'Trastornos del Sueño-Vigilia',
  'Trastornos por Uso de Sustancias',
  'Trastornos Bipolares y Relacionados',
  'Esquizofrenia y Otros Trastornos Psicóticos',
  'Trastornos Neurocognitivos',
  'Trastornos de Eliminación',
  'Trastornos Sexuales',
  'Trastornos Disruptivos del Control de Impulsos y de la Conducta',
  'Otros Diagnósticos',
]

export const DIAGNOSTICOS_DSM5: DiagnosticoDSM5[] = [
  // ===== TRASTORNOS DEPRESIVOS =====
  { codigo: 'F32.0', nombre: 'Episodio depresivo leve', categoria: 'Trastornos Depresivos' },
  { codigo: 'F32.1', nombre: 'Episodio depresivo moderado', categoria: 'Trastornos Depresivos' },
  { codigo: 'F32.2', nombre: 'Episodio depresivo grave sin síntomas psicóticos', categoria: 'Trastornos Depresivos' },
  { codigo: 'F32.3', nombre: 'Episodio depresivo grave con síntomas psicóticos', categoria: 'Trastornos Depresivos' },
  { codigo: 'F33.0', nombre: 'Trastorno depresivo mayor recurrente, episodio leve', categoria: 'Trastornos Depresivos' },
  { codigo: 'F33.1', nombre: 'Trastorno depresivo mayor recurrente, episodio moderado', categoria: 'Trastornos Depresivos' },
  { codigo: 'F33.2', nombre: 'Trastorno depresivo mayor recurrente, episodio grave', categoria: 'Trastornos Depresivos' },
  { codigo: 'F34.1', nombre: 'Trastorno distímico (Distimia)', categoria: 'Trastornos Depresivos' },
  { codigo: 'F32.81', nombre: 'Trastorno de disforia premenstrual', categoria: 'Trastornos Depresivos' },
  { codigo: 'F43.21', nombre: 'Trastorno de adaptación con estado de ánimo deprimido', categoria: 'Trastornos Depresivos' },
  { codigo: 'F43.22', nombre: 'Trastorno de adaptación con ansiedad y estado de ánimo deprimido', categoria: 'Trastornos Depresivos' },

  // ===== TRASTORNOS DE ANSIEDAD =====
  { codigo: 'F41.1', nombre: 'Trastorno de ansiedad generalizada', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F41.0', nombre: 'Trastorno de pánico (ataques de pánico recurrentes)', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F40.10', nombre: 'Fobia social (Trastorno de ansiedad social)', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F40.00', nombre: 'Agorafobia', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F40.2', nombre: 'Fobias específicas', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F40.1', nombre: 'Fobia social tipo ansiedad social', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F93.0', nombre: 'Trastorno de ansiedad por separación en la infancia', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F41.3', nombre: 'Otro trastorno de ansiedad mixto', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F41.8', nombre: 'Otro trastorno de ansiedad especificado', categoria: 'Trastornos de Ansiedad' },
  { codigo: 'F41.9', nombre: 'Trastorno de ansiedad no especificado', categoria: 'Trastornos de Ansiedad' },

  // ===== TRASTORNOS OBSESIVO-COMPULSIVOS Y RELACIONADOS =====
  { codigo: 'F42.2', nombre: 'Trastorno obsesivo-compulsivo, pensamientos y actos mixtos', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },
  { codigo: 'F42.0', nombre: 'Trastorno obsesivo-compulsivo, predominio de pensamientos/obsesiones', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },
  { codigo: 'F42.1', nombre: 'Trastorno obsesivo-compulsivo, predominio de actos compulsivos', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },
  { codigo: 'F45.22', nombre: 'Trastorno de dismorfia corporal', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },
  { codigo: 'F63.3', nombre: 'Tricotilomanía (Trastorno de arrancarse el pelo)', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },
  { codigo: 'F63.81', nombre: 'Trastorno de acumulación (Diógenes)', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },
  { codigo: 'F98.4', nombre: 'Trastorno de excoriación (Arrancarse la piel)', categoria: 'Trastornos Obsesivo-Compulsivos y Relacionados' },

  // ===== TRASTORNOS RELACIONADOS CON TRAUMAS Y FACTORES DE ESTRÉS =====
  { codigo: 'F43.10', nombre: 'Trastorno de estrés postraumático (TEPT)', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F43.11', nombre: 'TEPT en niños menores de 6 años', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F43.0', nombre: 'Trastorno de estrés agudo', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F43.20', nombre: 'Trastorno de adaptación con estado de ánimo alterado', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F43.23', nombre: 'Trastorno de adaptación con alteración de la conducta', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F43.24', nombre: 'Trastorno de adaptación con alteración mixta de las emociones y la conducta', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F43.25', nombre: 'Trastorno de adaptación, otro especificado', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F62.0', nombre: 'Cambio duradero de la personalidad tras experiencia catastrófica', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },
  { codigo: 'F62.81', nombre: 'Síndrome de la personalidad adquirida por adversidad prolongada', categoria: 'Trastornos Relacionados con Traumas y Factores de Estrés' },

  // ===== TRASTORNOS DISOCIATIVOS =====
  { codigo: 'F44.81', nombre: 'Trastorno de despersonalización/desrealización', categoria: 'Trastornos Disociativos' },
  { codigo: 'F44.1', nombre: 'Amnesia disociativa', categoria: 'Trastornos Disociativos' },
  { codigo: 'F44.0', nombre: 'Trastorno de identidad disociativo', categoria: 'Trastornos Disociativos' },
  { codigo: 'F44.82', nombre: 'Fuga disociativa', categoria: 'Trastornos Disociativos' },
  { codigo: 'F44.89', nombre: 'Otro trastorno disociativo especificado', categoria: 'Trastornos Disociativos' },

  // ===== TRASTORNOS DE SÍNTOMAS SOMÁTICOS Y RELACIONADOS =====
  { codigo: 'F45.0', nombre: 'Trastorno de síntomas somáticos', categoria: 'Trastornos de Síntomas Somáticos y Relacionados' },
  { codigo: 'F45.21', nombre: 'Trastorno de ansiedad por enfermedad', categoria: 'Trastornos de Síntomas Somáticos y Relacionados' },
  { codigo: 'F44.4', nombre: 'Trastorno de conversión (Trastorno neurológico funcional)', categoria: 'Trastornos de Síntomas Somáticos y Relacionados' },
  { codigo: 'F54', nombre: 'Factores psicológicos que afectan otras afecciones médicas', categoria: 'Trastornos de Síntomas Somáticos y Relacionados' },
  { codigo: 'F68.10', nombre: 'Trastorno facticio impuesto a uno mismo', categoria: 'Trastornos de Síntomas Somáticos y Relacionados' },
  { codigo: 'F68.11', nombre: 'Trastorno facticio impuesto a otro (por proxy)', categoria: 'Trastornos de Síntomas Somáticos y Relacionados' },

  // ===== TRASTORNOS DE LA CONDUCTA ALIMENTARIA =====
  { codigo: 'F50.00', nombre: 'Anorexia nerviosa, tipo restrictivo', categoria: 'Trastornos de la Conducta Alimentaria' },
  { codigo: 'F50.01', nombre: 'Anorexia nerviosa, tipo compulsivo/purgativo', categoria: 'Trastornos de la Conducta Alimentaria' },
  { codigo: 'F50.2', nombre: 'Bulimia nerviosa', categoria: 'Trastornos de la Conducta Alimentaria' },
  { codigo: 'F50.81', nombre: 'Trastorno por atracón', categoria: 'Trastornos de la Conducta Alimentaria' },
  { codigo: 'F50.89', nombre: 'Otro trastorno de la conducta alimentaria especificado', categoria: 'Trastornos de la Conducta Alimentaria' },
  { codigo: 'F50.9', nombre: 'Trastorno de la conducta alimentaria no especificado', categoria: 'Trastornos de la Conducta Alimentaria' },

  // ===== TRASTORNOS DE LA PERSONALIDAD =====
  { codigo: 'F60.2', nombre: 'Trastorno de personalidad antisocial', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.3', nombre: 'Trastorno de personalidad borderline (límite)', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.0', nombre: 'Trastorno de personalidad paranoide', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.1', nombre: 'Trastorno de personalidad esquizoide', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.4', nombre: 'Trastorno de personalidad histriónica', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.5', nombre: 'Trastorno de personalidad narcisista', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.6', nombre: 'Trastorno de personalidad por evitación', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.7', nombre: 'Trastorno de personalidad dependiente', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.81', nombre: 'Trastorno de personalidad obsesivo-compulsivo', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F60.89', nombre: 'Otro trastorno de personalidad especificado', categoria: 'Trastornos de la Personalidad' },
  { codigo: 'F07.0', nombre: 'Cambio de personalidad debido a otra afección médica', categoria: 'Trastornos de la Personalidad' },

  // ===== TRASTORNOS BIPOLARES Y RELACIONADOS =====
  { codigo: 'F31.0', nombre: 'Trastorno bipolar I, episodio maníaco único, leve', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F31.1', nombre: 'Trastorno bipolar I, episodio maníaco sin síntomas psicóticos', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F31.2', nombre: 'Trastorno bipolar I, episodio maníaco con síntomas psicóticos', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F31.3', nombre: 'Trastorno bipolar I, episodio depresivo actual', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F31.4', nombre: 'Trastorno bipolar I, en remisión parcial', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F31.5', nombre: 'Trastorno bipolar I, en remisión total', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F31.81', nombre: 'Trastorno bipolar II', categoria: 'Trastornos Bipolares y Relacionados' },
  { codigo: 'F34.0', nombre: 'Ciclotimia', categoria: 'Trastornos Bipolares y Relacionados' },

  // ===== TRASTORNOS DEL NEURODESARROLLO =====
  { codigo: 'F84.0', nombre: 'Trastorno del espectro autista', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F90.0', nombre: 'Trastorno por déficit de atención con hiperactividad, tipo predominio de falta de atención', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F90.1', nombre: 'TDAH, tipo predominio hiperactivo-impulsivo', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F90.2', nombre: 'TDAH, tipo combinado', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F90.8', nombre: 'TDAH, otro tipo especificado', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F81.0', nombre: 'Trastorno de la lectura (Dislexia)', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F81.2', nombre: 'Trastorno del cálculo (Discalculia)', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F81.1', nombre: 'Trastorno de la expresión escrita', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F82', nombre: 'Trastorno del desarrollo de la coordinación (Dispraxia)', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F80.0', nombre: 'Trastorno del desarrollo del habla y del lenguaje', categoria: 'Trastornos del Neurodesarrollo' },
  { codigo: 'F88', nombre: 'Otro trastorno del neurodesarrollo especificado', categoria: 'Trastornos del Neurodesarrollo' },

  // ===== ESQUIZOFRENIA Y OTROS TRASTORNOS PSICÓTICOS =====
  { codigo: 'F20.0', nombre: 'Esquizofrenia paranoide', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F20.1', nombre: 'Esquizofrenia desorganizada (Hebefrénica)', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F20.5', nombre: 'Esquizofrenia residual', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F25.0', nombre: 'Trastorno esquizoafectivo, tipo bipolar', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F25.1', nombre: 'Trastorno esquizoafectivo, tipo depresivo', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F23', nombre: 'Trastorno psicótico breve', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F28', nombre: 'Otro trastorno psicótico especificado', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },
  { codigo: 'F29', nombre: 'Trastorno psicótico no especificado', categoria: 'Esquizofrenia y Otros Trastornos Psicóticos' },

  // ===== TRASTORNOS DEL SUEÑO-VIGILIA =====
  { codigo: 'G47.00', nombre: 'Insomnio agudo', categoria: 'Trastornos del Sueño-Vigilia' },
  { codigo: 'G47.01', nombre: 'Insomnio crónico', categoria: 'Trastornos del Sueño-Vigilia' },
  { codigo: 'G47.09', nombre: 'Otro trastorno de insomnio', categoria: 'Trastornos del Sueño-Vigilia' },
  { codigo: 'G47.9', nombre: 'Trastorno del sueño no especificado', categoria: 'Trastornos del Sueño-Vigilia' },
  { codigo: 'F51.5', nombre: 'Trastorno de pesadillas', categoria: 'Trastornos del Sueño-Vigilia' },

  // ===== TRASTORNOS POR USO DE SUSTANCIAS =====
  { codigo: 'F10.10', nombre: 'Trastorno por uso de alcohol, leve', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F10.20', nombre: 'Trastorno por uso de alcohol, moderado', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F10.20', nombre: 'Trastorno por uso de alcohol, grave', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F12.10', nombre: 'Trastorno por uso de cannabis, leve', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F12.20', nombre: 'Trastorno por uso de cannabis, moderado/grave', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F15.10', nombre: 'Trastorno por uso de estimulantes, leve', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F15.20', nombre: 'Trastorno por uso de estimulantes, moderado/grave', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F11.10', nombre: 'Trastorno por uso de opioides, leve', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F11.20', nombre: 'Trastorno por uso de opioides, moderado/grave', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F14.10', nombre: 'Trastorno por uso de cocaína, leve', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F14.20', nombre: 'Trastorno por uso de cocaína, moderado/grave', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F17.210', nombre: 'Trastorno por uso de tabaco, leve', categoria: 'Trastornos por Uso de Sustancias' },
  { codigo: 'F55', nombre: 'Uso no dependiente de sustancias (Abuso)', categoria: 'Trastornos por Uso de Sustancias' },

  // ===== TRASTORNOS NEUROCOGNITIVOS =====
  { codigo: 'F02.80', nombre: 'Trastorno neurocognitivo mayor debido a enfermedad de Alzheimer', categoria: 'Trastornos Neurocognitivos' },
  { codigo: 'G30.9', nombre: 'Enfermedad de Alzheimer no especificada', categoria: 'Trastornos Neurocognitivos' },
  { codigo: 'F02.81', nombre: 'Trastorno neurocognitivo mayor vascular', categoria: 'Trastornos Neurocognitivos' },
  { codigo: 'G31.9', nombre: 'Trastorno neurocognitivo leve', categoria: 'Trastornos Neurocognitivos' },

  // ===== TRASTORNOS DISRUPITIVOS DEL CONTROL DE IMPULSOS Y DE LA CONDUCTA =====
  { codigo: 'F63.81', nombre: 'Trastorno explosivo intermitente', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F63.0', nombre: 'Juego patológico (Ludopatía)', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F63.1', nombre: 'Piromanía', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F63.3', nombre: 'Cleptomanía', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F91.0', nombre: 'Trastorno negativista desafiante', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F91.1', nombre: 'Trastorno disocial, tipo inicio en la infancia', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F91.3', nombre: 'Trastorno disocial, tipo inicio en la adolescencia', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },
  { codigo: 'F91.9', nombre: 'Trastorno disocial no especificado', categoria: 'Trastornos Disruptivos del Control de Impulsos y de la Conducta' },

  // ===== TRASTORNOS DE ELIMINACIÓN =====
  { codigo: 'F98.0', nombre: 'Enuresis no orgánica', categoria: 'Trastornos de Eliminación' },
  { codigo: 'F98.1', nombre: 'Encopresis no orgánica', categoria: 'Trastornos de Eliminación' },

  // ===== TRASTORNOS SEXUALES =====
  { codigo: 'F52.0', nombre: 'Trastorno del deseo sexual hipoactivo', categoria: 'Trastornos Sexuales' },
  { codigo: 'F52.22', nombre: 'Trastorno del orgasmo femenino', categoria: 'Trastornos Sexuales' },
  { codigo: 'F52.32', nombre: 'Eyaculación precoz (precoz)', categoria: 'Trastornos Sexuales' },
  { codigo: 'F52.21', nombre: 'Trastorno del interés/excitación sexual femenina', categoria: 'Trastornos Sexuales' },
  { codigo: 'F52.4', nombre: 'Vaginismo', categoria: 'Trastornos Sexuales' },
  { codigo: 'F52.31', nombre: 'Trastorno eréctil', categoria: 'Trastornos Sexuales' },
  { codigo: 'F52.9', nombre: 'Disfunción sexual no especificada', categoria: 'Trastornos Sexuales' },

  // ===== OTROS DIAGNÓSTICOS COMUNES =====
  { codigo: 'Z65.8', nombre: 'Duelo complicado/persistente', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z60.0', nombre: 'Ajuste a la etapa de vida (Crisis vital)', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z63.0', nombre: 'Problemas de relación con la pareja', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z63.8', nombre: 'Problemas de relación familiar', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z55.3', nombre: 'Bajo rendimiento escolar', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z62.890', nombre: 'Problemas de crianza (relación padre-hijo)', categoria: 'Otros Diagnósticos' },
  { codigo: 'R45.4', nombre: 'Irritabilidad y cólera', categoria: 'Otros Diagnósticos' },
  { codigo: 'R45.0', nombre: 'Nerviosismo', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z73.0', nombre: 'Agotamiento (Burnout)', categoria: 'Otros Diagnósticos' },
  { codigo: 'Z73.3', nombre: 'Estrés, no clasificado en otra parte', categoria: 'Otros Diagnósticos' },
  { codigo: 'F99', nombre: 'Trastorno mental no especificado', categoria: 'Otros Diagnósticos' },
]

// Helper: buscar diagnósticos
export function buscarDiagnosticos(query: string): DiagnosticoDSM5[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return DIAGNOSTICOS_DSM5.filter(d => {
    const nombre = d.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const codigo = d.codigo.toLowerCase()
    return nombre.includes(q) || codigo.includes(q)
  }).slice(0, 30) // limit results
}

// Helper: obtener diagnósticos por categoría
export function diagnosticosPorCategoria(categoria: string): DiagnosticoDSM5[] {
  return DIAGNOSTICOS_DSM5.filter(d => d.categoria === categoria)
}
