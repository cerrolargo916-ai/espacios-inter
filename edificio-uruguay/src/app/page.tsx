'use client'

import { useState } from 'react'

export default function Home() {
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/Edificio_Uruguay_Balance.xlsx'
    link.download = 'Edificio_Uruguay_Balance.xlsx'
    link.click()
    setDownloaded(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3a 50%, #1a4a3a 100%)' }}>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1B4D3E, #2D8B6A)' }}>
          <div className="text-5xl mb-3">🏢</div>
          <h1 className="text-2xl font-bold text-white">Edificio Uruguay</h1>
          <p className="text-emerald-100 mt-1 text-sm">27 apartamentos + 2 locales</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Balance de Ingresos y Gastos</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Ingresos por Unidad</p>
                <p className="text-xs text-gray-500">29 filas individualizadas (Apto 1-27 + Local 1-2)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 mt-0.5">✓</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Gastos del Edificio</p>
                <p className="text-xs text-gray-500">16 categorias de gastos colectivos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-600 mt-0.5">✓</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Resumen Balance</p>
                <p className="text-xs text-gray-500">Ingresos - Gastos + desglose proporcional por unidad</p>
              </div>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1B7D46, #219653)', boxShadow: '0 4px 15px rgba(27,125,70,0.4)' }}
          >
            {downloaded ? '✓ Descargado — Descargar de nuevo' : '⬇ Descargar Excel'}
          </button>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700 text-sm mb-2">Como subir a Google Sheets:</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Hace clic en &quot;Descargar Excel&quot;</li>
              <li>Abri <strong>drive.google.com</strong></li>
              <li>Arrastra el archivo descargado a Drive</li>
              <li>Doble clic → &quot;Abrir con Google Sheets&quot;</li>
              <li>Listo, se guarda automaticamente</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
