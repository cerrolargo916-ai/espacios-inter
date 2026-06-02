'use client'
import { useEffect } from 'react'
import { useSiteConfigStore } from './site-config-store'
import { CONFIG_DEFAULTS } from './config-defaults'

export { CONFIG_DEFAULTS }

/**
 * Hook that provides site configuration from the global Zustand store.
 * All components using this hook share the same state, so when
 * DashboardConfig saves changes, all other components see the update.
 */
export function useSiteConfig() {
  const config = useSiteConfigStore(s => s.config)
  const loaded = useSiteConfigStore(s => s.loaded)
  const loadConfig = useSiteConfigStore(s => s.loadConfig)
  const c = useSiteConfigStore(s => s.c)

  // Load config on first use
  useEffect(() => {
    if (!loaded) {
      loadConfig()
    }
  }, [loaded, loadConfig])

  return { config, c, loaded, reload: loadConfig }
}
