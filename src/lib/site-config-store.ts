import { create } from 'zustand'
import { CONFIG_DEFAULTS } from './config-defaults'

interface SiteConfigStore {
  config: Record<string, string>
  loaded: boolean
  setConfig: (config: Record<string, string>) => void
  loadConfig: () => Promise<void>
  c: (key: string) => string
}

export const useSiteConfigStore = create<SiteConfigStore>((set, get) => ({
  config: { ...CONFIG_DEFAULTS },
  loaded: false,

  setConfig: (config) => set({ config, loaded: true }),

  loadConfig: async () => {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' })
      const data = await res.json()
      set({ config: { ...CONFIG_DEFAULTS, ...data }, loaded: true })
    } catch {
      set({ config: { ...CONFIG_DEFAULTS }, loaded: true })
    }
  },

  c: (key: string): string => {
    const { config } = get()
    return config[key] || CONFIG_DEFAULTS[key] || ''
  },
}))
