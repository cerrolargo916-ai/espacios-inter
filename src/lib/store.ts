import { create } from 'zustand'

type CurrentView = 'landing' | 'psicologo' | 'paciente'
type DashSection = 'inicio' | 'pacientes' | 'turnos' | 'informes' | 'pagos' | 'config'
type PatientSection = 'turnos' | 'mis-turnos' | 'pagos' | 'recordatorios'

interface AppStore {
  currentView: CurrentView
  setCurrentView: (view: CurrentView) => void

  dashSection: DashSection
  setDashSection: (section: DashSection) => void

  patientSection: PatientSection
  setPatientSection: (section: PatientSection) => void

  selectedPacienteId: string | null
  setSelectedPacienteId: (id: string | null) => void

  selectedTurnoId: string | null
  setSelectedTurnoId: (id: string | null) => void

  selectedInformeId: string | null
  setSelectedInformeId: (id: string | null) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  showPacienteModal: boolean
  setShowPacienteModal: (show: boolean) => void

  showTurnoModal: boolean
  setShowTurnoModal: (show: boolean) => void

  showInformeModal: boolean
  setShowInformeModal: (show: boolean) => void

  showPagoModal: boolean
  setShowPagoModal: (show: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentView: 'landing',
  setCurrentView: (view) => set({ currentView: view }),

  dashSection: 'inicio',
  setDashSection: (section) => set({ dashSection: section }),

  patientSection: 'turnos',
  setPatientSection: (section) => set({ patientSection: section }),

  selectedPacienteId: null,
  setSelectedPacienteId: (id) => set({ selectedPacienteId: id }),

  selectedTurnoId: null,
  setSelectedTurnoId: (id) => set({ selectedTurnoId: id }),

  selectedInformeId: null,
  setSelectedInformeId: (id) => set({ selectedInformeId: id }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  showPacienteModal: false,
  setShowPacienteModal: (show) => set({ showPacienteModal: show }),

  showTurnoModal: false,
  setShowTurnoModal: (show) => set({ showTurnoModal: show }),

  showInformeModal: false,
  setShowInformeModal: (show) => set({ showInformeModal: show }),

  showPagoModal: false,
  setShowPagoModal: (show) => set({ showPagoModal: show }),
}))
