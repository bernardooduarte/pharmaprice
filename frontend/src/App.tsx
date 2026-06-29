import { useSyncExternalStore } from 'react'

import './App.css'

import { HomePage } from './pages/HomePage'
import { ResultadosPage } from './pages/ResultadosPage'

function subscribe(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange)
  return () => window.removeEventListener('popstate', onStoreChange)
}

function getSnapshot() {
  return `${window.location.pathname}${window.location.search}`
}

function App() {
  const route = useSyncExternalStore(subscribe, getSnapshot)
  const pathname = route.split('?')[0]

  if (pathname.startsWith('/resultados')) {
    return <ResultadosPage route={route} />
  }

  return <HomePage />
}

export default App
