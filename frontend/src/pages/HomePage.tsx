import { useState } from 'react'
import type { FormEvent } from 'react'

import { InfoCards } from '../components/InfoCards'
import { SearchBar } from '../components/SearchBar'
import { UfSelector } from '../components/UfSelector'
import { buildResultadosUrl } from '../services/api'

export function HomePage() {
  const [query, setQuery] = useState('')
  const [uf, setUf] = useState('MG')
  const [error, setError] = useState<string>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuery = query.trim()

    if (normalizedQuery.length < 2) {
      setError('Informe pelo menos 2 caracteres para continuar.')
      return
    }

    setError(undefined)

    const targetUrl = buildResultadosUrl({
      q: normalizedQuery,
      uf,
    })

    window.history.pushState({}, '', targetUrl)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <main className="home-page">
      <section className="hero-card">
        <div className="hero-card__content">
          <p className="eyebrow">Consulta regulatória e comparação prática</p>
          <h1>PharmaPrice</h1>
          <p className="hero-card__subtitle">
            Compare preços de medicamentos com base em referências oficiais da CMED
            e do PMC para apoiar decisões mais seguras e rápidas.
          </p>
        </div>

        <form className="search-panel" onSubmit={handleSubmit}>
          <SearchBar value={query} onChange={setQuery} error={error} />

          <div className="search-panel__footer">
            <UfSelector value={uf} onChange={setUf} />
            <button type="submit" className="search-panel__button">
              Buscar
            </button>
          </div>
        </form>
      </section>

      <InfoCards />
    </main>
  )
}
