import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No se recibió archivo de audio' }, { status: 400 })
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const base64Audio = audioBuffer.toString('base64')
    const mimeType = audioFile.type || 'audio/webm'

    const zai = await ZAI.create()

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Sos un asistente de transcripción médica. Transcribí el audio al español rioplatense/argentino. Usá terminología clínica y psicológica cuando corresponda. Devolvé SOLO la transcripción, sin explicaciones ni formato adicional.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Transcribí este audio de una sesión de psicología:'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Audio}`
              }
            }
          ]
        }
      ],
    })

    const transcription = response.choices[0]?.message?.content || ''

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error('Error in ASR:', error)
    return NextResponse.json({ error: 'Error al transcribir el audio' }, { status: 500 })
  }
}
