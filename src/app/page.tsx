'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Brain, Users, Calendar, FileText, DollarSign, Settings, Menu, X, Home,
  Plus, Search, Edit, Trash2, Eye, Mic, MicOff, Phone, Mail, MapPin,
  ChevronRight, ChevronLeft, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, UserPlus, CalendarCheck, Wallet, ArrowLeft, LogOut,
  Heart, Shield, Monitor, MessageCircle, Star, Send, QrCode,
  CreditCard, Banknote, Building, Smartphone, RefreshCw, Filter,
  Download, Printer, ChevronDown, Activity, BarChart3, PieChart as PieChartIcon,
  Bell, BellRing, Stethoscope, Microscope, ClipboardList, UserCheck,
  Briefcase, GraduationCap, Award, BookOpen, Sparkles, Waves, Leaf,
  CalendarPlus, Loader2, Lock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

// ============================
// Types
// ============================
interface Paciente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  fechaNacimiento: string | null
  dni: string | null
  direccion: string | null
  obraSocial: string | null
  numeroAfiliado: string | null
  contactoEmergencia: string | null
  notas: string | null
  activo: boolean
  createdAt: string
  _count?: { turnos: number; informes: number; pagos: number }
  turnos?: Turno[]
  informes?: InformeClinico[]
  pagos?: Pago[]
}

interface Turno {
  id: string
  pacienteId: string
  paciente?: { id: string; nombre: string; apellido: string; email?: string; telefono?: string }
  fecha: string
  duracion: number
  modalidad: string
  estado: string
  notas: string | null
  precio: number | null
  createdAt: string
  informes?: InformeClinico[]
  pagos?: Pago[]
}

interface InformeClinico {
  id: string
  pacienteId: string
  turnoId: string | null
  paciente?: { id: string; nombre: string; apellido: string }
  turno?: { id: string; fecha: string } | null
  fecha: string
  tipo: string
  motivoConsulta: string | null
  observaciones: string | null
  diagnostico: string | null
  planTratamiento: string | null
  evolucion: string | null
  firmado: boolean
  createdAt: string
}

interface Pago {
  id: string
  pacienteId: string
  turnoId: string | null
  paciente?: { id: string; nombre: string; apellido: string }
  turno?: { id: string; fecha: string } | null
  monto: number
  metodo: string
  estado: string
  referencia: string | null
  fechaPago: string | null
  createdAt: string
}

interface Stats {
  totalPacientes: number
  pacientesActivos: number
  turnosHoy: Turno[]
  turnosSemanaCount: number
  ingresosMes: number
  turnosPendientes: number
  pagosPendientes: number
  informesMes: number
  proximosTurnos: Turno[]
  pagosRecientes: Pago[]
  ultimosInformes: InformeClinico[]
  turnosPorEstado: { estado: string; _count: { estado: number } }[]
  pagosPorMetodo: { metodo: string; _sum: { monto: number | null }; _count: { metodo: number } }[]
  ingresosPorDia: { fechaPago: string | null; _sum: { monto: number | null } }[]
}

// ============================
// Voice Dictation Hook (Web Speech API + Audio Recording Fallback)
// ============================
function useVoiceDictation() {
  const [isListening, setIsListening] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [supported, setSupported] = useState<'native' | 'recorder' | 'none'>('none')
  const recognitionRef = useRef<unknown>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const callbackRef = useRef<((transcript: string, isFinal: boolean) => void) | null>(null)

  // Check support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (SpeechRecognitionAPI) {
      setSupported('native')
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setSupported('recorder')
    } else {
      setSupported('none')
    }
  }, [])

  // Native Web Speech API
  const startNativeListening = useCallback((fieldId: string, callback: (transcript: string, isFinal: boolean) => void) => {
    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return false

    if (isListening && recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop()
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-AR'
    recognition.continuous = true
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; [index: number]: { transcript: string } }[] }) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
          callback(finalTranscript, true)
        } else {
          interimTranscript += result[0].transcript
          callback(finalTranscript + interimTranscript, false)
        }
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      setActiveField(null)
    }

    recognition.onend = () => {
      setIsListening(false)
      setActiveField(null)
    }

    recognitionRef.current = recognition
    callbackRef.current = callback
    finalTranscript = ''
    setActiveField(fieldId)
    setIsListening(true)
    recognition.start()
    return true
  }, [isListening])

  // Audio Recorder Fallback (sends to backend ASR)
  const startRecorderListening = useCallback(async (fieldId: string, callback: (transcript: string, isFinal: boolean) => void) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setIsListening(false)
        setIsProcessing(true)

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')

        try {
          const res = await fetch('/api/asr', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.transcription) {
            callback(data.transcription, true)
          }
        } catch {
          // silently fail
        } finally {
          setIsProcessing(false)
          setActiveField(null)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      callbackRef.current = callback
      setActiveField(fieldId)
      setIsListening(true)
      mediaRecorder.start()
    } catch {
      setActiveField(null)
    }
  }, [])

  const startListening = useCallback((fieldId: string, callback: (transcript: string, isFinal: boolean) => void) => {
    if (supported === 'native') {
      startNativeListening(fieldId, callback)
    } else if (supported === 'recorder') {
      startRecorderListening(fieldId, callback)
    }
  }, [supported, startNativeListening, startRecorderListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop()
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      return // onstop will handle state
    }
    setIsListening(false)
    setActiveField(null)
  }, [])

  const toggleListening = useCallback((fieldId: string, callback: (transcript: string, isFinal: boolean) => void) => {
    if (isListening && activeField === fieldId) {
      stopListening()
    } else {
      startListening(fieldId, callback)
    }
  }, [isListening, activeField, startListening, stopListening])

  return { isListening, isProcessing, activeField, supported, startListening, stopListening, toggleListening }
}

// ============================
// API Helpers
// ============================
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión' }))
    throw new Error(err.error || 'Error en la solicitud')
  }
  return res.json()
}

// ============================
// Constants
// ============================
const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmado: 'bg-teal-100 text-teal-800 border-teal-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
  completado: 'bg-green-100 text-green-800 border-green-200',
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  completado: 'Completado',
}

const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mercadopago: 'MercadoPago',
  debito: 'Tarjeta de Débito',
  credito: 'Tarjeta de Crédito',
}

const METODO_ICONS: Record<string, React.ReactNode> = {
  efectivo: <Banknote className="h-4 w-4" />,
  transferencia: <Building className="h-4 w-4" />,
  mercadopago: <Smartphone className="h-4 w-4" />,
  debito: <CreditCard className="h-4 w-4" />,
  credito: <CreditCard className="h-4 w-4" />,
}

const PAGO_ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  pagado: 'bg-green-100 text-green-800',
  reembolsado: 'bg-blue-100 text-blue-800',
}

const TIPO_INFORME_LABELS: Record<string, string> = {
  sesion: 'Sesión',
  evaluacion: 'Evaluación',
  seguimiento: 'Seguimiento',
}

const CHART_COLORS = ['#0d9488', '#92400e', '#a8b5a0', '#14b8a6', '#b45309']

// ============================
// Micro Components
// ============================
function VoiceButton({ fieldId, voiceDictation, onTranscript, existingText }: {
  fieldId: string
  voiceDictation: ReturnType<typeof useVoiceDictation>
  onTranscript: (text: string) => void
  existingText?: string
}) {
  const isActive = voiceDictation.isListening && voiceDictation.activeField === fieldId
  const isProcessing = voiceDictation.isProcessing && voiceDictation.activeField === fieldId
  const isNotSupported = voiceDictation.supported === 'none'
  const isRecorderMode = voiceDictation.supported === 'recorder'

  const handleClick = () => {
    if (isNotSupported) return
    voiceDictation.toggleListening(fieldId, (transcript, isFinal) => {
      if (isFinal) {
        // Append to existing text with a space if there's existing content
        const newText = existingText ? existingText + ' ' + transcript : transcript
        onTranscript(newText)
      }
    })
  }

  return (
    <div className="ml-2 shrink-0 flex items-center gap-1">
      {isProcessing && (
        <span className="text-xs text-amber-600 animate-pulse">Procesando...</span>
      )}
      <Button
        type="button"
        variant={isActive ? 'destructive' : isNotSupported ? 'ghost' : 'outline'}
        size="sm"
        className={`${isActive ? 'animate-pulse-recording' : ''} ${isNotSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
        onClick={handleClick}
        disabled={isProcessing || isNotSupported}
        title={
          isNotSupported
            ? 'Dictado no disponible en este navegador. Usá Chrome o Edge.'
            : isRecorderMode
              ? isActive ? 'Detener grabación y transcribir' : 'Grabar audio para transcribir (español)'
              : isActive ? 'Detener dictado' : 'Iniciar dictado por voz (español)'
        }
      >
        {isActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  )
}

function StatusBadge({ estado, type = 'turno' }: { estado: string; type?: 'turno' | 'pago' }) {
  const colors = type === 'pago' ? PAGO_ESTADO_COLORS[estado] : ESTADO_COLORS[estado]
  const labels = type === 'pago'
    ? { pendiente: 'Pendiente', pagado: 'Pagado', reembolsado: 'Reembolsado' }
    : ESTADO_LABELS
  return (
    <Badge variant="outline" className={colors}>
      {labels[estado] || estado}
    </Badge>
  )
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)
}

function formatDateTime(dateStr: string) {
  return format(parseISO(dateStr), "d 'de' MMMM, yyyy - HH:mm", { locale: es })
}

function formatDateShort(dateStr: string) {
  return format(parseISO(dateStr), "d/M/yy", { locale: es })
}

function formatTime(dateStr: string) {
  return format(parseISO(dateStr), 'HH:mm', { locale: es })
}

function formatRelativeDate(dateStr: string) {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

// ============================
// LANDING PAGE
// ============================
function LandingPage() {
  const { setCurrentView } = useAppStore()
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [contactSent, setContactSent] = useState(false)
  const { toast } = useToast()

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSent(true)
    toast({ title: 'Mensaje enviado', description: 'Nos comunicaremos contigo a la brevedad.' })
    setTimeout(() => { setContactSent(false); setContactForm({ nombre: '', email: '', telefono: '', mensaje: '' }) }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-teal-800">Espacios Inter</h1>
                <p className="text-xs text-muted-foreground">Espacio para tu bienestar</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" onClick={() => setCurrentView('paciente')} className="text-teal-700 border-teal-300 hover:bg-teal-50">
                <UserCheck className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Portal Paciente</span>
                <span className="sm:hidden">Paciente</span>
              </Button>
              <Button size="sm" onClick={() => window.location.href = '/login'} className="bg-teal-600 hover:bg-teal-700">
                <Stethoscope className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Acceso Psicólogo</span>
                <span className="sm:hidden">Psicólogo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-40 right-40 w-48 h-48 bg-amber-200 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Badge className="mb-4 bg-teal-500/30 text-teal-100 border-teal-400/30">
                  <Sparkles className="h-3 w-3 mr-1" /> Consultorio de Psicología
                </Badge>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Espacios<br />
                  <span className="text-teal-200">Inter</span>
                </h2>
                <p className="text-xl sm:text-2xl text-teal-100 mb-2 font-light">Espacio para tu bienestar</p>
                <p className="text-teal-200/80 mb-8 max-w-lg leading-relaxed">
                  Un lugar seguro donde encontrar apoyo profesional para transitar tus procesos emocionales.
                  Lic. Silvia Hara te acompaña con calidez y profesionalismo.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold" onClick={() => setCurrentView('paciente')}>
                    <CalendarCheck className="h-5 w-5 mr-2" />
                    Reservar Turno
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Phone className="h-5 w-5 mr-2" />
                    Contactar
                  </Button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-teal-200" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Lic. Silvia Hara</h3>
                        <p className="text-teal-200">Psicóloga Clínica - MN 12345</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-teal-100">
                      <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-teal-300" /><span>Terapia Individual</span></div>
                      <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-teal-300" /><span>Terapia de Pareja</span></div>
                      <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-teal-300" /><span>Terapia Familiar</span></div>
                      <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-teal-300" /><span>Sesiones Online</span></div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-teal-200">
                      <Leaf className="h-4 w-4" />
                      <span>Enfoque integrador humanista-cognitivo</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* About */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 text-teal-700 border-teal-300">
                  <GraduationCap className="h-3 w-3 mr-1" /> Sobre la Profesional
                </Badge>
                <h3 className="text-3xl font-bold text-foreground mb-6">Lic. Silvia Hara</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Psicóloga egresada de la Universidad de Buenos Aires con más de 15 años de experiencia en clínica psicológica.
                  Especializada en terapia cognitivo-conductual y enfoque integrador humanista.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Mi compromiso es ofrecer un espacio seguro y confidencial donde cada persona pueda explorar sus emociones,
                  desarrollar herramientas de afrontamiento y alcanzar un mayor bienestar emocional.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Especialización en Terapia Cognitivo-Conductual</p>
                      <p className="text-sm text-muted-foreground">Instituto de Terapia Cognitiva - 2015</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Posgrado en Psicoterapia Integradora</p>
                      <p className="text-sm text-muted-foreground">UBA - 2012</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Licenciatura en Psicología</p>
                      <p className="text-sm text-muted-foreground">Universidad de Buenos Aires - 2008</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Users className="h-8 w-8" />, number: '500+', label: 'Pacientes atendidos' },
                  { icon: <Calendar className="h-8 w-8" />, number: '15+', label: 'Años de experiencia' },
                  { icon: <Star className="h-8 w-8" />, number: '4.9', label: 'Valoración promedio' },
                  { icon: <Monitor className="h-8 w-8" />, number: '100%', label: 'Disponibilidad online' },
                ].map((stat, i) => (
                  <Card key={i} className="text-center border-teal-100">
                    <CardContent className="pt-6">
                      <div className="mx-auto mb-3 text-teal-600">{stat.icon}</div>
                      <p className="text-2xl font-bold text-teal-800">{stat.number}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 sm:py-20 bg-warm-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-teal-700 border-teal-300">
                <Briefcase className="h-3 w-3 mr-1" /> Servicios
              </Badge>
              <h3 className="text-3xl font-bold mb-3">¿Cómo puedo ayudarte?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ofrezco diferentes modalidades de terapia adaptadas a tus necesidades
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: 'Terapia Individual',
                  desc: 'Espacio personal para trabajar ansiedad, depresión, estrés, autoestima y procesos de cambio.',
                  price: '$15.000',
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: 'Terapia de Pareja',
                  desc: 'Mejora la comunicación, resolución de conflictos y reconexión emocional con tu pareja.',
                  price: '$20.000',
                },
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: 'Terapia Familiar',
                  desc: 'Aborda dinámicas familiares, límites saludables y fortalecimiento de vínculos.',
                  price: '$22.000',
                },
                {
                  icon: <Monitor className="h-8 w-8" />,
                  title: 'Sesiones Online',
                  desc: 'Terapia desde la comodidad de tu hogar con la misma calidad y confidencialidad.',
                  price: '$12.000',
                },
              ].map((service, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-teal-100 hover:border-teal-300">
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      {service.icon}
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.desc}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teal-700">{service.price}</span>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setCurrentView('paciente')}>
                      Reservar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-teal-700 border-teal-300">
                <MessageCircle className="h-3 w-3 mr-1" /> Testimonios
              </Badge>
              <h3 className="text-3xl font-bold mb-3">Lo que dicen mis pacientes</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'María G.',
                  text: 'La Lic. Hara me ayudó a comprender mi ansiedad y darme herramientas reales para manejarla. Me siento mucho mejor.',
                  stars: 5,
                },
                {
                  name: 'Carlos R.',
                  text: 'Las sesiones de pareja fueron transformadoras. Aprendimos a comunicarnos de una manera que nunca antes habíamos podido.',
                  stars: 5,
                },
                {
                  name: 'Luciana M.',
                  text: 'Las sesiones online son súper cómodas y la misma calidad que presenciales. Recomiendo totalmente Espacios Inter.',
                  stars: 5,
                },
              ].map((t, i) => (
                <Card key={i} className="border-teal-100">
                  <CardContent className="pt-6">
                    <div className="flex mb-3">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-teal-100">
                        <AvatarFallback className="text-teal-700 text-xs">{t.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{t.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contacto" className="py-16 sm:py-20 bg-warm-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <Badge variant="outline" className="mb-4 text-teal-700 border-teal-300">
                  <Phone className="h-3 w-3 mr-1" /> Contacto
                </Badge>
                <h3 className="text-3xl font-bold mb-6">Contáctame</h3>
                <p className="text-muted-foreground mb-8">
                  Estoy disponible para responder tus consultas y coordinar tu primera sesión.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-muted-foreground">11-5555-1234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">contacto@espaciosinter.com.ar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-muted-foreground">Av. Las Heras 2456, Piso 3, Dpto B, CABA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Horarios</p>
                      <p className="text-muted-foreground">Lunes a Viernes: 9:00 - 20:00 | Sábados: 9:00 - 13:00</p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle>Envíame un mensaje</CardTitle>
                  <CardDescription>Completa el formulario y me comunicaré contigo a la brevedad</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-nombre">Nombre completo</Label>
                      <Input id="contact-nombre" value={contactForm.nombre} onChange={e => setContactForm(f => ({ ...f, nombre: e.target.value }))} required />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input id="contact-email" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-telefono">Teléfono</Label>
                        <Input id="contact-telefono" value={contactForm.telefono} onChange={e => setContactForm(f => ({ ...f, telefono: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-mensaje">Mensaje</Label>
                      <Textarea id="contact-mensaje" rows={4} value={contactForm.mensaje} onChange={e => setContactForm(f => ({ ...f, mensaje: e.target.value }))} required />
                    </div>
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={contactSent}>
                      {contactSent ? <><CheckCircle className="h-4 w-4 mr-2" /> Mensaje Enviado</> : <><Send className="h-4 w-4 mr-2" /> Enviar Mensaje</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-teal-900 text-teal-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-teal-300" />
              <span className="font-semibold">Espacios Inter</span>
              <span className="text-teal-400">|</span>
              <span className="text-sm text-teal-300">Espacio para tu bienestar</span>
            </div>
            <p className="text-sm text-teal-400">&copy; {new Date().getFullYear()} Espacios Inter - Lic. Silvia Hara</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================
// PSYCHOLOGIST DASHBOARD
// ============================
function DashboardSidebar() {
  const { dashSection, setDashSection, setCurrentView, sidebarOpen, setSidebarOpen } = useAppStore()

  const menuItems = [
    { id: 'inicio' as const, icon: <Home className="h-5 w-5" />, label: 'Panel de Inicio' },
    { id: 'pacientes' as const, icon: <Users className="h-5 w-5" />, label: 'Pacientes' },
    { id: 'turnos' as const, icon: <Calendar className="h-5 w-5" />, label: 'Agenda de Turnos' },
    { id: 'informes' as const, icon: <FileText className="h-5 w-5" />, label: 'Informes Clínicos' },
    { id: 'pagos' as const, icon: <DollarSign className="h-5 w-5" />, label: 'Pagos' },
    { id: 'config' as const, icon: <Settings className="h-5 w-5" />, label: 'Configuración' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm text-teal-800 truncate">Espacios Inter</h2>
            <p className="text-xs text-muted-foreground">Lic. Silvia Hara</p>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setDashSection(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                dashSection === item.id
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t space-y-1">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
          <button
            onClick={() => setCurrentView('landing')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al Inicio
          </button>
        </div>
      </aside>
    </>
  )
}

function DashboardInicio() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { setDashSection } = useAppStore()

  useEffect(() => {
    apiFetch<Stats>('/api/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
    )
  }

  if (!stats) return <p className="text-destructive">Error al cargar estadísticas</p>

  const statCards = [
    { title: 'Pacientes Activos', value: stats.pacientesActivos, icon: <Users className="h-5 w-5" />, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { title: 'Turnos Hoy', value: stats.turnosHoy.length, icon: <CalendarCheck className="h-5 w-5" />, color: 'text-amber-700', bgColor: 'bg-amber-50' },
    { title: 'Turnos esta Semana', value: stats.turnosSemanaCount, icon: <Calendar className="h-5 w-5" />, color: 'text-teal-700', bgColor: 'bg-teal-50' },
    { title: 'Ingresos del Mes', value: formatCurrency(stats.ingresosMes), icon: <TrendingUp className="h-5 w-5" />, color: 'text-green-700', bgColor: 'bg-green-50' },
  ]

  const turnoEstadoData = stats.turnosPorEstado.map(e => ({
    name: ESTADO_LABELS[e.estado] || e.estado,
    value: e._count.estado,
  }))

  const pagoMetodoData = stats.pagosPorMetodo.map(p => ({
    name: METODO_LABELS[p.metodo] || p.metodo,
    monto: p._sum.monto || 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Panel de Inicio</h2>
        <p className="text-muted-foreground">Bienvenida, Lic. Silvia Hara</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Turnos de hoy */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Turnos de Hoy</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setDashSection('turnos')}>Ver todos <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.turnosHoy.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No hay turnos para hoy</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {stats.turnosHoy.map(turno => (
                  <div key={turno.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[3rem]">
                        <p className="text-sm font-bold">{formatTime(turno.fecha)}</p>
                        <p className="text-xs text-muted-foreground">{turno.duracion}min</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{turno.paciente?.nombre} {turno.paciente?.apellido}</p>
                        <p className="text-xs text-muted-foreground capitalize">{turno.modalidad}</p>
                      </div>
                    </div>
                    <StatusBadge estado={turno.estado} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos turnos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Próximos Turnos</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setDashSection('turnos')}>Ver agenda <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.proximosTurnos.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No hay próximos turnos</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {stats.proximosTurnos.slice(0, 6).map(turno => (
                  <div key={turno.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{turno.paciente?.nombre} {turno.paciente?.apellido}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(turno.fecha)} - {formatTime(turno.fecha)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{turno.modalidad}</Badge>
                      <StatusBadge estado={turno.estado} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Turnos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {turnoEstadoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={turnoEstadoData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {turnoEstadoData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pagos por Método</CardTitle>
          </CardHeader>
          <CardContent>
            {pagoMetodoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pagoMetodoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="monto" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="font-semibold text-amber-800">Pagos Pendientes</p>
            </div>
            <p className="text-2xl font-bold text-amber-700">{formatCurrency(stats.pagosPendientes)}</p>
            <p className="text-sm text-amber-600">{stats.turnosPendientes} turnos por confirmar</p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 bg-teal-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-teal-600" />
              <p className="font-semibold text-teal-800">Informes del Mes</p>
            </div>
            <p className="text-2xl font-bold text-teal-700">{stats.informesMes}</p>
            <p className="text-sm text-teal-600">informes clínicos generados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editPaciente, setEditPaciente] = useState<Paciente | null>(null)
  const { toast } = useToast()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '',
    dni: '', direccion: '', obraSocial: '', numeroAfiliado: '', contactoEmergencia: '', notas: '',
  })

  useEffect(() => {
    let active = true
    apiFetch<Paciente[]>(`/api/pacientes${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then(data => { if (active) { setPacientes(data); setLoading(false) } })
      .catch(err => { console.error(err); if (active) setLoading(false) })
    return () => { active = false }
  }, [search])

  const fetchPacientes = useCallback(() => {
    setLoading(true)
    apiFetch<Paciente[]>(`/api/pacientes${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then(setPacientes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search])

  const openCreate = () => {
    setEditPaciente(null)
    setForm({ nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '', dni: '', direccion: '', obraSocial: '', numeroAfiliado: '', contactoEmergencia: '', notas: '' })
    setShowModal(true)
  }

  const openEdit = (p: Paciente) => {
    setEditPaciente(p)
    setForm({
      nombre: p.nombre, apellido: p.apellido, email: p.email,
      telefono: p.telefono || '', fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.split('T')[0] : '',
      dni: p.dni || '', direccion: p.direccion || '', obraSocial: p.obraSocial || '',
      numeroAfiliado: p.numeroAfiliado || '', contactoEmergencia: p.contactoEmergencia || '', notas: p.notas || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editPaciente) {
        await apiFetch(`/api/pacientes/${editPaciente.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
        toast({ title: 'Paciente actualizado', description: `${form.nombre} ${form.apellido}` })
      } else {
        await apiFetch('/api/pacientes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
        toast({ title: 'Paciente creado', description: `${form.nombre} ${form.apellido}` })
      }
      setShowModal(false)
      fetchPacientes()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await apiFetch(`/api/pacientes/${id}`, { method: 'DELETE' })
      toast({ title: 'Paciente desactivado' })
      fetchPacientes()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const filtered = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.apellido.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.dni && p.dni.includes(search))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pacientes</h2>
          <p className="text-muted-foreground">{pacientes.length} pacientes registrados</p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <UserPlus className="h-4 w-4 mr-2" /> Nuevo Paciente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, email o DNI..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
          title="Sin pacientes"
          description="No se encontraron pacientes con los criterios de búsqueda"
          action={<Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700"><UserPlus className="h-4 w-4 mr-2" /> Agregar Paciente</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <Card key={p.id} className={`hover:shadow-md transition-shadow ${!p.activo ? 'opacity-60' : ''}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 bg-teal-100">
                      <AvatarFallback className="text-teal-700">{p.nombre[0]}{p.apellido[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{p.nombre} {p.apellido}</p>
                        {!p.activo && <Badge variant="outline" className="bg-red-50 text-red-600 text-xs">Inactivo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{p.email} {p.telefono ? `· ${p.telefono}` : ''}</p>
                      <div className="flex gap-3 mt-1">
                        {p._count && <span className="text-xs text-muted-foreground">{p._count.turnos} turnos</span>}
                        {p._count && <span className="text-xs text-muted-foreground">{p._count.informes} informes</span>}
                        {p.obraSocial && <span className="text-xs text-teal-600">{p.obraSocial}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPaciente(p)} title="Ver detalle"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Editar"><Edit className="h-4 w-4" /></Button>
                    {p.activo && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeactivate(p.id)} title="Desactivar"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
            <DialogDescription>{editPaciente ? 'Modifica los datos del paciente' : 'Completa los datos del nuevo paciente'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} required /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Fecha de Nacimiento</Label><Input type="date" value={form.fechaNacimiento} onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))} /></div>
              <div className="space-y-2"><Label>DNI</Label><Input value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Dirección</Label><Input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Obra Social</Label><Input value={form.obraSocial} onChange={e => setForm(f => ({ ...f, obraSocial: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Número de Afiliado</Label><Input value={form.numeroAfiliado} onChange={e => setForm(f => ({ ...f, numeroAfiliado: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Contacto de Emergencia</Label><Input value={form.contactoEmergencia} onChange={e => setForm(f => ({ ...f, contactoEmergencia: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={3} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">{editPaciente ? 'Guardar Cambios' : 'Crear Paciente'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedPaciente} onOpenChange={() => setSelectedPaciente(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPaciente?.nombre} {selectedPaciente?.apellido}</DialogTitle>
          </DialogHeader>
          {selectedPaciente && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedPaciente.email}</p></div>
                <div><p className="text-sm text-muted-foreground">Teléfono</p><p className="font-medium">{selectedPaciente.telefono || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">DNI</p><p className="font-medium">{selectedPaciente.dni || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Obra Social</p><p className="font-medium">{selectedPaciente.obraSocial || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Contacto Emergencia</p><p className="font-medium">{selectedPaciente.contactoEmergencia || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Dirección</p><p className="font-medium">{selectedPaciente.direccion || '-'}</p></div>
              </div>
              {selectedPaciente.notas && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedPaciente.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [showModal, setShowModal] = useState(false)
  const [editTurno, setEditTurno] = useState<Turno | null>(null)
  const { toast } = useToast()

  const [form, setForm] = useState({
    pacienteId: '', fecha: '', hora: '09:00', duracion: '60', modalidad: 'presencial', estado: 'pendiente', notas: '', precio: '15000',
  })

  useEffect(() => {
    let active = true
    const params = filter !== 'todos' ? `?estado=${filter}` : ''
    Promise.all([
      apiFetch<Turno[]>(`/api/turnos${params}`),
      apiFetch<Paciente[]>('/api/pacientes'),
    ]).then(([t, p]) => { if (active) { setTurnos(t); setPacientes(p); setLoading(false) } })
      .catch(err => { console.error(err); if (active) setLoading(false) })
    return () => { active = false }
  }, [filter])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = filter !== 'todos' ? `?estado=${filter}` : ''
    Promise.all([
      apiFetch<Turno[]>(`/api/turnos${params}`),
      apiFetch<Paciente[]>('/api/pacientes'),
    ]).then(([t, p]) => { setTurnos(t); setPacientes(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filter])

  const openCreate = () => {
    setEditTurno(null)
    setForm({ pacienteId: '', fecha: '', hora: '09:00', duracion: '60', modalidad: 'presencial', estado: 'pendiente', notas: '', precio: '15000' })
    setShowModal(true)
  }

  const openEdit = (t: Turno) => {
    setEditTurno(t)
    const fecha = parseISO(t.fecha)
    setForm({
      pacienteId: t.pacienteId,
      fecha: format(fecha, 'yyyy-MM-dd'),
      hora: format(fecha, 'HH:mm'),
      duracion: String(t.duracion),
      modalidad: t.modalidad,
      estado: t.estado,
      notas: t.notas || '',
      precio: String(t.precio || ''),
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        pacienteId: form.pacienteId,
        fecha: `${form.fecha}T${form.hora}:00`,
        duracion: parseInt(form.duracion),
        modalidad: form.modalidad,
        estado: form.estado,
        notas: form.notas || null,
        precio: form.precio ? parseFloat(form.precio) : null,
      }
      if (editTurno) {
        await apiFetch(`/api/turnos/${editTurno.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        toast({ title: 'Turno actualizado' })
      } else {
        await apiFetch('/api/turnos', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        toast({ title: 'Turno creado' })
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const updateEstado = async (id: string, estado: string) => {
    try {
      await apiFetch(`/api/turnos/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }),
      })
      toast({ title: `Turno ${ESTADO_LABELS[estado]?.toLowerCase() || estado}` })
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const cancelTurno = async (id: string) => {
    try {
      await apiFetch(`/api/turnos/${id}`, { method: 'DELETE' })
      toast({ title: 'Turno cancelado' })
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const groupedTurnos = useMemo(() => {
    const groups: Record<string, Turno[]> = {}
    const sorted = [...turnos].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    for (const t of sorted) {
      const key = format(parseISO(t.fecha), 'yyyy-MM-dd')
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [turnos])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Agenda de Turnos</h2>
          <p className="text-muted-foreground">{turnos.length} turnos</p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Turno
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['todos', 'pendiente', 'confirmado', 'completado', 'cancelado'].map(estado => (
          <Button key={estado} variant={filter === estado ? 'default' : 'outline'} size="sm"
            className={filter === estado ? 'bg-teal-600 hover:bg-teal-700' : ''}
            onClick={() => setFilter(estado)}>
            {estado === 'todos' ? 'Todos' : ESTADO_LABELS[estado]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}</div>
      ) : groupedTurnos.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
          title="Sin turnos"
          description="No hay turnos para los filtros seleccionados"
          action={<Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4 mr-2" /> Crear Turno</Button>}
        />
      ) : (
        <div className="space-y-4">
          {groupedTurnos.map(([dateKey, dayTurnos]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                {formatRelativeDate(dateKey + 'T00:00:00')} - {formatDateShort(dateKey + 'T00:00:00')}
              </h3>
              <div className="space-y-2">
                {dayTurnos.map(turno => (
                  <Card key={turno.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="text-center min-w-[3.5rem]">
                            <p className="text-sm font-bold text-teal-700">{formatTime(turno.fecha)}</p>
                            <p className="text-xs text-muted-foreground">{turno.duracion}min</p>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{turno.paciente?.nombre} {turno.paciente?.apellido}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs capitalize">{turno.modalidad}</Badge>
                              {turno.precio && <span className="text-xs text-muted-foreground">{formatCurrency(turno.precio)}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge estado={turno.estado} />
                          <div className="flex gap-1">
                            {turno.estado === 'pendiente' && (
                              <Button variant="ghost" size="sm" className="text-teal-600 h-8" onClick={() => updateEstado(turno.id, 'confirmado')}><CheckCircle className="h-4 w-4" /></Button>
                            )}
                            {turno.estado === 'confirmado' && (
                              <Button variant="ghost" size="sm" className="text-green-600 h-8" onClick={() => updateEstado(turno.id, 'completado')}><CheckCircle className="h-4 w-4" /></Button>
                            )}
                            {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
                              <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => cancelTurno(turno.id)}><XCircle className="h-4 w-4" /></Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8" onClick={() => openEdit(turno)}><Edit className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTurno ? 'Editar Turno' : 'Nuevo Turno'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={form.pacienteId} onValueChange={v => setForm(f => ({ ...f, pacienteId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                <SelectContent>
                  {pacientes.filter(p => p.activo).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Hora</Label><Input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duración</Label>
                <Select value={form.duracion} onValueChange={v => setForm(f => ({ ...f, duracion: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modalidad</Label>
                <Select value={form.modalidad} onValueChange={v => setForm(f => ({ ...f, modalidad: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => setForm(f => ({ ...f, estado: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Precio ($)</Label><Input type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">{editTurno ? 'Guardar' : 'Crear Turno'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardInformes() {
  const [informes, setInformes] = useState<InformeClinico[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editInforme, setEditInforme] = useState<InformeClinico | null>(null)
  const [selectedInforme, setSelectedInforme] = useState<InformeClinico | null>(null)
  const [filterPaciente, setFilterPaciente] = useState<string>('todos')
  const voiceDictation = useVoiceDictation()
  const { toast } = useToast()

  const [form, setForm] = useState({
    pacienteId: '', turnoId: '', tipo: 'sesion',
    motivoConsulta: '', observaciones: '', diagnostico: '', planTratamiento: '', evolucion: '', firmado: false,
  })

  useEffect(() => {
    let active = true
    const params = filterPaciente !== 'todos' ? `?pacienteId=${filterPaciente}` : ''
    Promise.all([
      apiFetch<InformeClinico[]>(`/api/informes${params}`),
      apiFetch<Paciente[]>('/api/pacientes'),
    ]).then(([i, p]) => { if (active) { setInformes(i); setPacientes(p); setLoading(false) } })
      .catch(err => { console.error(err); if (active) setLoading(false) })
    return () => { active = false }
  }, [filterPaciente])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = filterPaciente !== 'todos' ? `?pacienteId=${filterPaciente}` : ''
    Promise.all([
      apiFetch<InformeClinico[]>(`/api/informes${params}`),
      apiFetch<Paciente[]>('/api/pacientes'),
    ]).then(([i, p]) => { setInformes(i); setPacientes(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filterPaciente])

  const openCreate = () => {
    setEditInforme(null)
    setForm({ pacienteId: '', turnoId: '', tipo: 'sesion', motivoConsulta: '', observaciones: '', diagnostico: '', planTratamiento: '', evolucion: '', firmado: false })
    setShowModal(true)
  }

  const openEdit = (inf: InformeClinico) => {
    setEditInforme(inf)
    setForm({
      pacienteId: inf.pacienteId, turnoId: inf.turnoId || '', tipo: inf.tipo,
      motivoConsulta: inf.motivoConsulta || '', observaciones: inf.observaciones || '',
      diagnostico: inf.diagnostico || '', planTratamiento: inf.planTratamiento || '',
      evolucion: inf.evolucion || '', firmado: inf.firmado,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        pacienteId: form.pacienteId,
        turnoId: form.turnoId || null,
        tipo: form.tipo,
        motivoConsulta: form.motivoConsulta || null,
        observaciones: form.observaciones || null,
        diagnostico: form.diagnostico || null,
        planTratamiento: form.planTratamiento || null,
        evolucion: form.evolucion || null,
        firmado: form.firmado,
      }
      if (editInforme) {
        await apiFetch(`/api/informes/${editInforme.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        toast({ title: 'Informe actualizado' })
      } else {
        await apiFetch('/api/informes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        toast({ title: 'Informe creado' })
      }
      setShowModal(false)
      voiceDictation.stopListening()
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const voiceField = (fieldId: string, fieldName: keyof typeof form) => (
    <VoiceButton
      fieldId={fieldId}
      voiceDictation={voiceDictation}
      onTranscript={(text) => {
        setForm(f => ({ ...f, [fieldName]: text }))
      }}
      existingText={form[fieldName] as string}
    />
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Informes Clínicos</h2>
          <p className="text-muted-foreground">{informes.length} informes registrados</p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Informe
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filterPaciente} onValueChange={setFilterPaciente}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filtrar por paciente" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los pacientes</SelectItem>
            {pacientes.filter(p => p.activo).map(p => (
              <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {voiceDictation.isListening && (
          <Badge className="bg-red-100 text-red-700 animate-pulse-recording">
            <Mic className="h-3 w-3 mr-1" /> Grabando...
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}</div>
      ) : informes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          title="Sin informes"
          description="Crea tu primer informe clínico con dictado por voz"
          action={<Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4 mr-2" /> Crear Informe</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {informes.map(inf => (
            <Card key={inf.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-teal-50 text-teal-700">{TIPO_INFORME_LABELS[inf.tipo] || inf.tipo}</Badge>
                      {inf.firmado && <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Firmado</Badge>}
                    </div>
                    <p className="font-medium text-sm">{inf.paciente?.nombre} {inf.paciente?.apellido}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(inf.fecha)}</p>
                    {inf.motivoConsulta && <p className="text-xs text-muted-foreground mt-1 truncate">Motivo: {inf.motivoConsulta}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedInforme(inf)} title="Ver"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(inf)} title="Editar"><Edit className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal with Voice Dictation */}
      <Dialog open={showModal} onOpenChange={(open) => { setShowModal(open); if (!open) voiceDictation.stopListening() }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editInforme ? 'Editar Informe Clínico' : 'Nuevo Informe Clínico'}</DialogTitle>
            <DialogDescription>
              Usa el botón del micrófono para dictar por voz cada campo
              {voiceDictation.isListening && <span className="text-red-500 font-semibold ml-2">● Grabando...</span>}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={form.pacienteId} onValueChange={v => setForm(f => ({ ...f, pacienteId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                  <SelectContent>
                    {pacientes.filter(p => p.activo).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Informe</Label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sesion">Sesión</SelectItem>
                    <SelectItem value="evaluacion">Evaluación</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label>Motivo de Consulta</Label>
                {voiceField('motivoConsulta', 'motivoConsulta')}
              </div>
              <Textarea value={form.motivoConsulta} onChange={e => setForm(f => ({ ...f, motivoConsulta: e.target.value }))} rows={2} placeholder="Describe el motivo de consulta o usa el micrófono para dictar..." />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label>Observaciones</Label>
                {voiceField('observaciones', 'observaciones')}
              </div>
              <Textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={3} placeholder="Observaciones de la sesión o usa el micrófono..." />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label>Diagnóstico</Label>
                {voiceField('diagnostico', 'diagnostico')}
              </div>
              <Textarea value={form.diagnostico} onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))} rows={2} placeholder="Diagnóstico clínico o usa el micrófono..." />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label>Plan de Tratamiento</Label>
                {voiceField('planTratamiento', 'planTratamiento')}
              </div>
              <Textarea value={form.planTratamiento} onChange={e => setForm(f => ({ ...f, planTratamiento: e.target.value }))} rows={3} placeholder="Plan de tratamiento o usa el micrófono..." />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label>Evolución</Label>
                {voiceField('evolucion', 'evolucion')}
              </div>
              <Textarea value={form.evolucion} onChange={e => setForm(f => ({ ...f, evolucion: e.target.value }))} rows={2} placeholder="Evolución del paciente o usa el micrófono..." />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.firmado} onCheckedChange={v => setForm(f => ({ ...f, firmado: v }))} />
              <Label>Firmado digitalmente</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); voiceDictation.stopListening() }}>Cancelar</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">{editInforme ? 'Guardar Cambios' : 'Crear Informe'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedInforme} onOpenChange={() => setSelectedInforme(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informe Clínico - {TIPO_INFORME_LABELS[selectedInforme?.tipo || 'sesion']}</DialogTitle>
            <DialogDescription>
              {selectedInforme?.paciente?.nombre} {selectedInforme?.paciente?.apellido} - {selectedInforme ? formatDateTime(selectedInforme.fecha) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedInforme && (
            <div className="space-y-4">
              {selectedInforme.firmado && (
                <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Firmado digitalmente</Badge>
              )}
              {selectedInforme.motivoConsulta && (
                <div><h4 className="font-semibold text-sm mb-1">Motivo de Consulta</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInforme.motivoConsulta}</p></div>
              )}
              {selectedInforme.observaciones && (
                <div><h4 className="font-semibold text-sm mb-1">Observaciones</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInforme.observaciones}</p></div>
              )}
              {selectedInforme.diagnostico && (
                <div><h4 className="font-semibold text-sm mb-1">Diagnóstico</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInforme.diagnostico}</p></div>
              )}
              {selectedInforme.planTratamiento && (
                <div><h4 className="font-semibold text-sm mb-1">Plan de Tratamiento</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInforme.planTratamiento}</p></div>
              )}
              {selectedInforme.evolucion && (
                <div><h4 className="font-semibold text-sm mb-1">Evolución</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInforme.evolucion}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardPagos() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [showModal, setShowModal] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const { toast } = useToast()

  const [form, setForm] = useState({
    pacienteId: '', turnoId: '', monto: '', metodo: 'efectivo', estado: 'pendiente', referencia: '',
  })

  useEffect(() => {
    let active = true
    const params = filter !== 'todos' ? `?estado=${filter}` : ''
    Promise.all([
      apiFetch<Pago[]>(`/api/pagos${params}`),
      apiFetch<Paciente[]>('/api/pacientes'),
    ]).then(([p, pac]) => { if (active) { setPagos(p); setPacientes(pac); setLoading(false) } })
      .catch(err => { console.error(err); if (active) setLoading(false) })
    return () => { active = false }
  }, [filter])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = filter !== 'todos' ? `?estado=${filter}` : ''
    Promise.all([
      apiFetch<Pago[]>(`/api/pagos${params}`),
      apiFetch<Paciente[]>('/api/pacientes'),
    ]).then(([p, pac]) => { setPagos(p); setPacientes(pac) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: form.pacienteId,
          turnoId: form.turnoId || null,
          monto: parseFloat(form.monto),
          metodo: form.metodo,
          estado: form.estado,
          referencia: form.referencia || null,
        }),
      })
      toast({ title: 'Pago registrado' })
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const markAsPaid = async (id: string) => {
    try {
      await apiFetch(`/api/pagos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'pagado', fechaPago: new Date().toISOString() }),
      })
      toast({ title: 'Pago marcado como pagado' })
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pagos</h2>
          <p className="text-muted-foreground">{pagos.length} registros</p>
        </div>
        <Button onClick={() => { setForm({ pacienteId: '', turnoId: '', monto: '', metodo: 'efectivo', estado: 'pendiente', referencia: '' }); setShowModal(true) }} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" /> Registrar Pago
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Pagado</p><p className="text-2xl font-bold text-green-700">{formatCurrency(totalPagado)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Pendiente</p><p className="text-2xl font-bold text-amber-700">{formatCurrency(totalPendiente)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Registros</p><p className="text-2xl font-bold text-teal-700">{pagos.length}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {['todos', 'pendiente', 'pagado', 'reembolsado'].map(estado => (
          <Button key={estado} variant={filter === estado ? 'default' : 'outline'} size="sm"
            className={filter === estado ? 'bg-teal-600 hover:bg-teal-700' : ''}
            onClick={() => setFilter(estado)}>
            {estado === 'todos' ? 'Todos' : { pendiente: 'Pendientes', pagado: 'Pagados', reembolsado: 'Reembolsados' }[estado]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}</div>
      ) : pagos.length === 0 ? (
        <EmptyState icon={<DollarSign className="h-8 w-8 text-muted-foreground" />} title="Sin pagos" description="No hay pagos para los filtros seleccionados" />
      ) : (
        <div className="grid gap-3">
          {pagos.map(pago => (
            <Card key={pago.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      {METODO_ICONS[pago.metodo] || <DollarSign className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{pago.paciente?.nombre} {pago.paciente?.apellido}</p>
                      <p className="text-xs text-muted-foreground">{METODO_LABELS[pago.metodo]} {pago.fechaPago ? `· ${formatDateShort(pago.fechaPago)}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-bold text-sm">{formatCurrency(pago.monto)}</p>
                    <StatusBadge estado={pago.estado} type="pago" />
                    {pago.estado === 'pendiente' && (
                      <Button variant="ghost" size="sm" className="text-green-600 h-8" onClick={() => markAsPaid(pago.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={form.pacienteId} onValueChange={v => setForm(f => ({ ...f, pacienteId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                <SelectContent>
                  {pacientes.filter(p => p.activo).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Monto ($)</Label><Input type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required /></div>
              <div className="space-y-2">
                <Label>Método</Label>
                <Select value={form.metodo} onValueChange={v => setForm(f => ({ ...f, metodo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    <SelectItem value="debito">Tarjeta de Débito</SelectItem>
                    <SelectItem value="credito">Tarjeta de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => setForm(f => ({ ...f, estado: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Referencia</Label><Input value={form.referencia} onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))} placeholder="Nro. referencia" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardConfig() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { toast } = useToast()

  const loadConfig = useCallback(() => {
    setLoading(true)
    fetch('/api/config')
      .then(res => res.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  const configFields = [
    { key: 'nombre_clinica', label: 'Nombre del Consultorio', placeholder: 'Espacios Inter' },
    { key: 'nombre_psicologa', label: 'Nombre de la Psicóloga', placeholder: 'Lic. Silvia Hara' },
    { key: 'telefono_clinica', label: 'Teléfono', placeholder: '11-5555-1234' },
    { key: 'email_clinica', label: 'Email', placeholder: 'contacto@espaciosinter.com.ar' },
    { key: 'direccion_clinica', label: 'Dirección', placeholder: 'Av. Las Heras 2456, CABA' },
    { key: 'precio_sesion_presencial', label: 'Precio Sesión Presencial ($)', placeholder: '15000' },
    { key: 'precio_sesion_online', label: 'Precio Sesión Online ($)', placeholder: '12000' },
    { key: 'duracion_sesion', label: 'Duración de Sesión (minutos)', placeholder: '60' },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      toast({ title: 'Configuración guardada', description: 'Los cambios se guardaron exitosamente.' })
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await apiFetch<{ message: string }>('/api/reset', { method: 'POST' })
      toast({ title: 'Datos eliminados', description: 'Todos los datos fueron borrados. Podés cargar datos nuevos o usar los de ejemplo.' })
      loadConfig()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setResetting(false)
    }
  }

  const handleSeed = async () => {
    setResetting(true)
    try {
      const res = await apiFetch<{ message: string }>('/api/seed', { method: 'POST' })
      toast({ title: 'Datos de ejemplo cargados', description: res.message })
      loadConfig()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-muted-foreground">Ajustes del consultorio Espacios Inter</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Consultorio</CardTitle>
          <CardDescription>Editá la información general. Los cambios se guardan al presionar &quot;Guardar Cambios&quot;.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configFields.map(field => (
            <div key={field.key} className="grid sm:grid-cols-3 gap-2 items-center">
              <Label className="sm:text-right">{field.label}</Label>
              <div className="sm:col-span-2">
                <Input
                  value={config[field.key] || ''}
                  placeholder={field.placeholder}
                  disabled={loading}
                  onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={saving || loading}>
              {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Guardar Cambios</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Datos</CardTitle>
          <CardDescription>Administrá los datos del sistema. Podés limpiar todo y empezar de cero, o cargar datos de ejemplo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleReset}
              disabled={resetting}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Limpiar Todos los Datos
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleSeed}
              disabled={resetting}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${resetting ? 'animate-spin' : ''}`} /> Cargar Datos de Ejemplo
            </Button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">¿Cómo cargar datos reales?</p>
                <p className="text-amber-700">
                  Andá a <strong>Pacientes</strong> y hacé clic en &quot;Nuevo Paciente&quot; para cargar datos reales.
                  Luego podés crear turnos e informes clínicos desde las secciones correspondientes.
                  Los datos de ejemplo son solo para probar el sistema.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dictado por Voz</CardTitle>
          <CardDescription>Información sobre el reconocimiento de voz en informes clínicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mic className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-teal-800 mb-1">¿Cómo funciona el dictado?</p>
                <ul className="text-teal-700 space-y-1 list-disc list-inside">
                  <li>En <strong>Informes Clínicos</strong>, cada campo de texto tiene un botón de micrófono</li>
                  <li>En <strong>Chrome o Edge</strong>: el dictado es en tiempo real (español argentino)</li>
                  <li>En otros navegadores: grabás el audio y se transcribe al finalizar</li>
                  <li>El texto dictado se agrega al contenido existente del campo</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PsychologistDashboard() {
  const { data: session, status } = useSession()
  const { dashSection, setCurrentView } = useAppStore()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 border-teal-100">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center">
                <Lock className="h-7 w-7 text-teal-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-teal-800">Acceso Restringido</CardTitle>
            <CardDescription>
              Necesitás iniciar sesión para acceder al panel del psicólogo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => window.location.href = '/login'}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentView('landing')}
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="md:hidden mb-4">
            <Button variant="outline" size="sm" onClick={() => useAppStore.getState().setSidebarOpen(true)}>
              <Menu className="h-4 w-4 mr-2" /> Menú
            </Button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={dashSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {dashSection === 'inicio' && <DashboardInicio />}
              {dashSection === 'pacientes' && <DashboardPacientes />}
              {dashSection === 'turnos' && <DashboardTurnos />}
              {dashSection === 'informes' && <DashboardInformes />}
              {dashSection === 'pagos' && <DashboardPagos />}
              {dashSection === 'config' && <DashboardConfig />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// ============================
// PATIENT PORTAL
// ============================
function PatientPortal() {
  const { patientSection, setPatientSection, setCurrentView } = useAppStore()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    apiFetch<Paciente[]>('/api/pacientes').then(p => {
      setPacientes(p)
      if (p.length > 0) setSelectedPaciente(p[0])
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedPaciente) return
    let active = true
    Promise.all([
      apiFetch<Turno[]>(`/api/turnos?pacienteId=${selectedPaciente.id}`),
      apiFetch<Pago[]>(`/api/pagos?pacienteId=${selectedPaciente.id}`),
    ]).then(([t, p]) => { if (active) { setTurnos(t); setPagos(p) } }).catch(console.error)
    return () => { active = false }
  }, [selectedPaciente])

  const fetchPatientData = useCallback(() => {
    if (!selectedPaciente) return
    Promise.all([
      apiFetch<Turno[]>(`/api/turnos?pacienteId=${selectedPaciente.id}`),
      apiFetch<Pago[]>(`/api/pagos?pacienteId=${selectedPaciente.id}`),
    ]).then(([t, p]) => { setTurnos(t); setPagos(p) }).catch(console.error)
  }, [selectedPaciente])

  const patientMenuItems = [
    { id: 'turnos' as const, icon: <CalendarPlus className="h-5 w-5" />, label: 'Reservar Turno' },
    { id: 'mis-turnos' as const, icon: <Calendar className="h-5 w-5" />, label: 'Mis Turnos' },
    { id: 'pagos' as const, icon: <CreditCard className="h-5 w-5" />, label: 'Mis Pagos' },
    { id: 'recordatorios' as const, icon: <Bell className="h-5 w-5" />, label: 'Recordatorios' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('landing')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-teal-800">Espacios Inter</span>
          </div>
          <Select value={selectedPaciente?.id || ''} onValueChange={v => {
            const p = pacientes.find(p => p.id === v)
            setSelectedPaciente(p || null)
          }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Seleccionar perfil" /></SelectTrigger>
            <SelectContent>
              {pacientes.filter(p => p.activo).map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={patientSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {patientSection === 'turnos' && <PatientBookTurno paciente={selectedPaciente} onBooked={fetchPatientData} />}
            {patientSection === 'mis-turnos' && <PatientMisTurnos turnos={turnos} />}
            {patientSection === 'pagos' && <PatientPagos pagos={pagos} turnos={turnos} />}
            {patientSection === 'recordatorios' && <PatientRecordatorios turnos={turnos} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t z-50 safe-area-bottom">
        <div className="max-w-5xl mx-auto grid grid-cols-4">
          {patientMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPatientSection(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                patientSection === item.id ? 'text-teal-600' : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function PatientBookTurno({ paciente, onBooked }: { paciente: Paciente | null; onBooked: () => void }) {
  const [form, setForm] = useState({ fecha: '', hora: '09:00', modalidad: 'presencial' })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paciente) { toast({ title: 'Selecciona tu perfil', variant: 'destructive' }); return }
    setSubmitting(true)
    try {
      await apiFetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: paciente.id,
          fecha: `${form.fecha}T${form.hora}:00`,
          duracion: 60,
          modalidad: form.modalidad,
          estado: 'pendiente',
          precio: form.modalidad === 'online' ? 12000 : 15000,
        }),
      })
      toast({ title: 'Turno reservado', description: 'Te contactaremos para confirmar la disponibilidad.' })
      setForm({ fecha: '', hora: '09:00', modalidad: 'presencial' })
      onBooked()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reservar Turno</h2>
        <p className="text-muted-foreground">Selecciona fecha, hora y modalidad para tu sesión</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-teal-100">
          <CardHeader>
            <CardTitle>Datos de la Sesión</CardTitle>
            <CardDescription>Completa los datos para solicitar tu turno</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required min={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Select value={form.hora} onValueChange={v => setForm(f => ({ ...f, hora: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modalidad</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, modalidad: 'presencial' }))}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      form.modalidad === 'presencial' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border'
                    }`}
                  >
                    <MapPin className="h-6 w-6 mx-auto mb-1" />
                    <p className="font-medium text-sm">Presencial</p>
                    <p className="text-xs text-muted-foreground">$15.000</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, modalidad: 'online' }))}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      form.modalidad === 'online' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border'
                    }`}
                  >
                    <Monitor className="h-6 w-6 mx-auto mb-1" />
                    <p className="font-medium text-sm">Online</p>
                    <p className="text-xs text-muted-foreground">$12.000</p>
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={submitting}>
                {submitting ? 'Reservando...' : 'Reservar Turno'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-teal-100 bg-teal-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-8 w-8 text-teal-600" />
                <div>
                  <p className="font-semibold text-teal-800">Lic. Silvia Hara</p>
                  <p className="text-sm text-teal-600">Psicóloga Clínica</p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-teal-600" /><span>Lunes a Viernes: 9:00 - 20:00</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-teal-600" /><span>Sábados: 9:00 - 13:00</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-600" /><span>Av. Las Heras 2456, CABA</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Información Importante</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />Confirmaremos tu turno por email o teléfono</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />Las sesiones online se realizan por videollamada</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />Puedes cancelar hasta 24hs antes sin cargo</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />Múltiples métodos de pago disponibles</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PatientMisTurnos({ turnos }: { turnos: Turno[] }) {
  const upcoming = turnos.filter(t => t.estado !== 'cancelado' && t.estado !== 'completado' && new Date(t.fecha) >= new Date())
  const past = turnos.filter(t => t.estado === 'completado' || (t.estado !== 'cancelado' && new Date(t.fecha) < new Date()))
  const cancelled = turnos.filter(t => t.estado === 'cancelado')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Turnos</h2>
        <p className="text-muted-foreground">Consulta y gestiona tus turnos</p>
      </div>

      <Tabs defaultValue="proximos">
        <TabsList>
          <TabsTrigger value="proximos">Próximos ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="pasados">Pasados ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados ({cancelled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proximos" className="mt-4">
          {upcoming.length === 0 ? (
            <EmptyState icon={<Calendar className="h-8 w-8 text-muted-foreground" />} title="No hay turnos próximos" description="Reserva un nuevo turno para comenzar" />
          ) : (
            <div className="space-y-3">
              {upcoming.map(t => (
                <Card key={t.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{formatRelativeDate(t.fecha)}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(t.fecha)} · {t.duracion} minutos · {t.modalidad === 'online' ? 'Online' : 'Presencial'}</p>
                        {t.precio && <p className="text-sm font-medium text-teal-700 mt-1">{formatCurrency(t.precio)}</p>}
                      </div>
                      <StatusBadge estado={t.estado} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pasados" className="mt-4">
          {past.length === 0 ? (
            <EmptyState icon={<Calendar className="h-8 w-8 text-muted-foreground" />} title="Sin turnos pasados" description="Tus turnos completados aparecerán aquí" />
          ) : (
            <div className="space-y-3">
              {past.map(t => (
                <Card key={t.id} className="opacity-80">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatDateShort(t.fecha)} - {formatTime(t.fecha)}</p>
                        <p className="text-sm text-muted-foreground capitalize">{t.modalidad} · {t.duracion}min</p>
                      </div>
                      <StatusBadge estado={t.estado} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelados" className="mt-4">
          {cancelled.length === 0 ? (
            <EmptyState icon={<XCircle className="h-8 w-8 text-muted-foreground" />} title="Sin cancelaciones" description="No tienes turnos cancelados" />
          ) : (
            <div className="space-y-3">
              {cancelled.map(t => (
                <Card key={t.id} className="opacity-60">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatDateShort(t.fecha)} - {formatTime(t.fecha)}</p>
                        {t.notas && <p className="text-sm text-muted-foreground">{t.notas}</p>}
                      </div>
                      <StatusBadge estado="cancelado" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PatientPagos({ pagos, turnos }: { pagos: Pago[]; turnos: Turno[] }) {
  const [showPayment, setShowPayment] = useState<Pago | null>(null)
  const { toast } = useToast()

  const handlePay = async (pago: Pago) => {
    try {
      await apiFetch(`/api/pagos/${pago.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'pagado', fechaPago: new Date().toISOString() }),
      })
      toast({ title: 'Pago realizado', description: `Pago de ${formatCurrency(pago.monto)} registrado` })
      setShowPayment(null)
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const pendientes = pagos.filter(p => p.estado === 'pendiente')
  const completados = pagos.filter(p => p.estado === 'pagado')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Pagos</h2>
        <p className="text-muted-foreground">Gestiona tus pagos y métodos de pago</p>
      </div>

      {pendientes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-800">Pagos Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendientes.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium">{formatCurrency(p.monto)}</p>
                  <p className="text-sm text-muted-foreground">{METODO_LABELS[p.metodo]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge estado={p.estado} type="pago" />
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowPayment(p)}>
                    Pagar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {completados.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay pagos completados</p>
          ) : (
            <div className="space-y-3">
              {completados.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      {METODO_ICONS[p.metodo] || <DollarSign className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{formatCurrency(p.monto)}</p>
                      <p className="text-xs text-muted-foreground">{METODO_LABELS[p.metodo]} {p.fechaPago ? `· ${formatDateShort(p.fechaPago)}` : ''}</p>
                    </div>
                  </div>
                  <StatusBadge estado={p.estado} type="pago" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Realizar Pago</DialogTitle>
            <DialogDescription>Monto: {showPayment ? formatCurrency(showPayment.monto) : ''}</DialogDescription>
          </DialogHeader>
          {showPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(METODO_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    className="p-3 rounded-lg border-2 border-border hover:border-teal-500 hover:bg-teal-50 transition-all flex flex-col items-center gap-1"
                    onClick={() => handlePay({ ...showPayment, metodo: key })}
                  >
                    {METODO_ICONS[key]}
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
              {showPayment.metodo === 'mercadopago' && (
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <QrCode className="h-20 w-20 mx-auto text-teal-700 mb-2" />
                  <p className="text-sm text-teal-700">Escanea el código QR para pagar con MercadoPago</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PatientRecordatorios({ turnos }: { turnos: Turno[] }) {
  const upcoming = turnos
    .filter(t => t.estado !== 'cancelado' && new Date(t.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Recordatorios</h2>
        <p className="text-muted-foreground">Tus próximos turnos y notificaciones</p>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-8 w-8 text-muted-foreground" />}
          title="Sin recordatorios"
          description="No tienes turnos próximos. Reserva uno para ver recordatorios aquí."
        />
      ) : (
        <div className="space-y-4">
          {upcoming.map((t, i) => {
            const date = parseISO(t.fecha)
            const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            return (
              <Card key={t.id} className={i === 0 ? 'border-teal-300 bg-teal-50/50' : ''}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${i === 0 ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{formatRelativeDate(t.fecha)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(t.fecha)} · {t.duracion} minutos · {t.modalidad === 'online' ? 'Online' : 'Presencial'}</p>
                      {daysUntil === 0 && <Badge className="mt-1 bg-amber-100 text-amber-700">¡Hoy!</Badge>}
                      {daysUntil === 1 && <Badge className="mt-1 bg-teal-100 text-teal-700">Mañana</Badge>}
                      {daysUntil > 1 && <Badge variant="outline" className="mt-1">En {daysUntil} días</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================
// MAIN PAGE
// ============================
export default function HomePage() {
  const { currentView } = useAppStore()
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    if (!seeded) {
      fetch('/api/seed', { method: 'POST' })
        .then(() => setSeeded(true))
        .catch(() => setSeeded(true))
    }
  }, [seeded])

  return (
    <AnimatePresence mode="wait">
      {currentView === 'landing' && (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LandingPage />
        </motion.div>
      )}
      {currentView === 'psicologo' && (
        <motion.div key="psicologo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PsychologistDashboard />
        </motion.div>
      )}
      {currentView === 'paciente' && (
        <motion.div key="paciente" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PatientPortal />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
