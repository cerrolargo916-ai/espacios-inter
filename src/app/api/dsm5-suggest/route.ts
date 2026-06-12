import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { motivoConsulta, observaciones, evolucion } = await request.json()

    const textoClinico = [motivoConsulta, observaciones, evolucion].filter(Boolean).join(' | ')

    if (!textoClinico || textoClinico.length < 10) {
      return NextResponse.json({ diagnosticos: [], nota: 'Se necesita más información clínica para sugerir un diagnóstico.' })
    }

    const zai = await ZAI.create()

    const prompt = `Eres un psicólogo clínico experto en diagnósticos DSM-5/CIE-10. Analizá la siguiente información clínica de un paciente y sugerí los diagnósticos DSM-5 más probables.

INFORMACIÓN CLÍNICA:
${textoClinico}

INSTRUCCIONES:
- Sugerí hasta 3 diagnósticos DSM-5 probables, ordenados de más a menos probable
- Para cada diagnóstico, incluí: código CIE-10, nombre completo del trastorno DSM-5, y una breve justificación
- Solo sugerí diagnósticos que sean consistentes con la información proporcionada
- Si la información es insuficiente para un diagnóstico, indicá "Especificar" como código
- Respondé en formato JSON exactamente como este ejemplo, sin texto adicional:

{
  "diagnosticos": [
    {
      "codigo": "F41.1",
      "nombre": "Trastorno de ansiedad generalizada",
      "categoria": "Trastornos de Ansiedad",
      "probabilidad": "alta",
      "justificacion": "El paciente presenta preocupación excesiva y difícil de controlar durante más de 6 meses"
    }
  ]
}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Sos un psicólogo clínico experto en diagnósticos DSM-5. Respondé ÚNICAMENTE con JSON válido, sin texto adicional ni formato markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content || ''

    // Parse the JSON response
    let result
    try {
      // Try to extract JSON from the response (in case it has markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        result = { diagnosticos: [] }
      }
    } catch {
      result = { diagnosticos: [] }
    }

    // Ensure we have a valid structure
    if (!result.diagnosticos || !Array.isArray(result.diagnosticos)) {
      result = { diagnosticos: [] }
    }

    return NextResponse.json({
      diagnosticos: result.diagnosticos.slice(0, 3),
      nota: result.diagnosticos.length === 0 ? 'No se pudo determinar un diagnóstico con la información proporcionada.' : undefined
    })

  } catch (error) {
    console.error('Error in DSM-5 suggestion:', error)
    return NextResponse.json({ error: 'Error al sugerir diagnóstico' }, { status: 500 })
  }
}
