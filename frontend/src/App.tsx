import { useSyncExternalStore } from 'react'

import './App.css'

import { HomePage } from './pages/HomePage'

function subscribe(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange)
  return () => window.removeEventListener('popstate', onStoreChange)
}

function getSnapshot() {
  return `${window.location.pathname}${window.location.search}`
}

function ResultadosPlaceholder() {
  const searchParams = new URLSearchParams(window.location.search)
  const q = searchParams.get('q') ?? ''
  const uf = searchParams.get('uf') ?? 'MG'

  return (
    <main className="results-placeholder">
      <div className="results-placeholder__card">
        <p className="eyebrow">Próxima etapa</p>
        <h1>Resultados em construção</h1>
        <p>
          A navegação da Home já está pronta. Quando a tela de resultados for
          implementada, a busca será feita com os parâmetros abaixo:
        </p>
        <code>{`/resultados?q=${q}&uf=${uf}`}</code>
      </div>
    </main>
  )
}

function App() {
  const route = useSyncExternalStore(subscribe, getSnapshot)
  const pathname = route.split('?')[0]

  if (pathname.startsWith('/resultados')) {
    return <ResultadosPlaceholder />
  }

  return <HomePage />
}

export default App
