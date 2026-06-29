import { useState } from 'react'
import type { FormEvent } from 'react'

import { InfoCards } from '../components/InfoCards'
import { SearchBar } from '../components/SearchBar'
import { UfSelector } from '../components/UfSelector'
import { buildResultadosUrl } from '../services/api'

type HomePageProps = {
  onNavigate?: () => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [query, setQuery] = useState('')
  const [uf, setUf] = useState('MG')
  const [error, setError] = useState<string>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = query.trim()
    if (normalized.length < 2) {
      setError('Informe pelo menos 2 caracteres para continuar.')
      return
    }

    setError(undefined)
    const url = buildResultadosUrl({ q: normalized, uf })
    window.history.pushState({}, '', url)
    window.dispatchEvent(new PopStateEvent('popstate'))
    onNavigate?.()
  }

  return (
    <main className="home-page">
      <section className="hero-card">
        <div className="hero-card__badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="var(--green)">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          Dados oficiais CMED/ANVISA
        </div>

        <div className="hero-card__content">
          <h1>PharmaPrice: Transparência e Economia na Compra de Medicamentos</h1>
          <p className="hero-card__subtitle">
            Compare preços de medicamentos com base em referências oficiais da CMED
            e do PMC para apoiar decisões mais seguras e rápidas.
          </p>
        </div>

        <form className="search-panel" onSubmit={handleSubmit}>
          <div className="search-panel__main">
            <SearchBar value={query} onChange={setQuery} error={error} />
            <button type="submit" className="search-panel__button">Buscar</button>
          </div>
          <div className="search-panel__footer">
            <UfSelector value={uf} onChange={setUf} />
          </div>
        </form>
      </section>

      <InfoCards />
    </main>
  )
}
