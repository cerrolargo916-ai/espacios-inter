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

    const zai = await ZAI.create()

    const response = await zai.audio.asr.create({
      file_base64: base64Audio
    })

    const transcription = response.text || ''

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error('Error in ASR:', error)
    return NextResponse.json({ error: 'Error al transcribir el audio' }, { status: 500 })
  }
}
