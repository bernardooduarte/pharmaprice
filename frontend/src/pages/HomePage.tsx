import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { InfoCards } from '../components/InfoCards'
import { SearchBar } from '../components/SearchBar'
import { UfSelector } from '../components/UfSelector'
import { buildResultadosUrl } from '../services/api'
import { getBuscas, limparBuscas, registrarBusca } from '../services/historico'
import { getConfiguracoes } from '../services/configuracoes'

type HomePageProps = {
  onNavigate?: () => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [query, setQuery] = useState('')
  const [uf, setUf] = useState(() => getConfiguracoes().uf)
  const [error, setError] = useState<string>()
  const [buscasRecentes, setBuscasRecentes] = useState(() => getBuscas())
  const farmaciasMonitoradas = [
    'Drogasil',
    'Araújo',
    'Pacheco',
    'São Paulo',
    'Ultrafarma',
    'Raia',
    'Indiana',
  ]

  useEffect(() => {
    function carregarBuscas() {
      setBuscasRecentes(getBuscas())
    }

    carregarBuscas()
    window.addEventListener('pharmaprice:historico-changed', carregarBuscas)
    return () => window.removeEventListener('pharmaprice:historico-changed', carregarBuscas)
  }, [])

  function navegarPara(url: string) {
    window.history.pushState({}, '', url)
    window.dispatchEvent(new PopStateEvent('popstate'))
    onNavigate?.()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = query.trim()
    if (normalized.length < 2) {
      setError('Informe pelo menos 2 caracteres para continuar.')
      return
    }

    setError(undefined)
    registrarBusca(normalized, uf)
    navegarPara(buildResultadosUrl({ q: normalized, uf }))
  }

  function handleChipClick(termo: string) {
    registrarBusca(termo, uf)
    navegarPara(buildResultadosUrl({ q: termo, uf }))
  }

  function handleLimparBuscas() {
    limparBuscas()
    setBuscasRecentes([])
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
          <p className="search-panel__heading">Buscar medicamento</p>
          <div className="search-panel__main">
            <SearchBar value={query} onChange={setQuery} error={error} />
            <button type="submit" className="search-panel__button">Buscar</button>
          </div>
          <div className="search-panel__footer">
            <UfSelector value={uf} onChange={setUf} />
          </div>
        </form>

        <div className="home-farmacias" aria-label="Farmácias monitoradas">
          <span className="home-farmacias__label">Farmácias monitoradas:</span>
          <div className="home-farmacias__chips">
            {farmaciasMonitoradas.map((farmacia) => (
              <span key={farmacia} className="home-farmacias__chip" title={farmacia}>
                <span className="home-farmacias__avatar" aria-hidden="true">
                  {farmacia
                    .split(' ')
                    .map((parte) => parte[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <span>{farmacia}</span>
              </span>
            ))}
          </div>
        </div>

        {buscasRecentes.length > 0 ? (
          <div className="home-recentes" aria-label="Buscas recentes">
            <span className="home-recentes__label">Buscas recentes:</span>
            {buscasRecentes.map((busca) => (
              <button
                key={busca.id}
                type="button"
                className="home-recentes__chip"
                onClick={() => handleChipClick(busca.termo)}
              >
                {busca.termo}
              </button>
            ))}
            <button type="button" className="home-recentes__clear" onClick={handleLimparBuscas}>
              Limpar histórico
            </button>
          </div>
        ) : null}
      </section>

      <InfoCards />
    </main>
  )
}
