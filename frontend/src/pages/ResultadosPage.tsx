import { useEffect, useMemo, useState } from 'react'

import { ResultadoCard } from '../components/ResultadoCard'
import { buscarMedicamentos, buildResultadosUrl } from '../services/api'
import type { MedicamentoResultado } from '../services/api'

type ResultadosPageProps = {
  route: string
}

export function ResultadosPage({ route }: ResultadosPageProps) {
  const searchParams = useMemo(() => {
    const queryString = route.includes('?') ? route.slice(route.indexOf('?')) : ''
    return new URLSearchParams(queryString)
  }, [route])

  const q = searchParams.get('q')?.trim() ?? ''
  const uf = (searchParams.get('uf')?.trim().toUpperCase() || 'MG')

  const [resultados, setResultados] = useState<MedicamentoResultado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function carregarResultados() {
      if (q.length < 2) {
        setResultados([])
        setError('Informe ao menos 2 caracteres para realizar a busca.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await buscarMedicamentos(q, uf, 20)
        if (!isActive) {
          return
        }

        setResultados(data)
      } catch (requestError) {
        if (!isActive) {
          return
        }

        setResultados([])
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Ocorreu um erro inesperado ao buscar medicamentos.',
        )
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void carregarResultados()

    return () => {
      isActive = false
    }
  }, [q, uf])

  const novaBuscaUrl = buildResultadosUrl({ q, uf })

  return (
    <main className="resultados-page">
      <section className="resultados-hero">
        <div className="resultados-hero__content">
          <p className="eyebrow">Busca regulatória CMED</p>
          <h1>{`Resultados para "${q || 'medicamento'}" em ${uf}`}</h1>
          <p className="resultados-hero__subtitle">
            Lista de medicamentos encontrados com base nas referências oficiais da
            CMED e no PMC disponível para a UF selecionada.
          </p>
        </div>

        <div className="resultados-toolbar">
          <a className="resultados-toolbar__back" href="/">
            Nova busca
          </a>
          <code>{novaBuscaUrl}</code>
        </div>
      </section>

      {loading ? (
        <section className="feedback-card">
          <p className="eyebrow">Carregando</p>
          <h2>Buscando medicamentos...</h2>
          <p>Aguarde enquanto consultamos os dados da CMED para a busca atual.</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="feedback-card feedback-card--error">
          <p className="eyebrow">Falha na busca</p>
          <h2>Não foi possível carregar os resultados</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {!loading && !error && resultados.length === 0 ? (
        <section className="feedback-card">
          <p className="eyebrow">Nenhum resultado</p>
          <h2>Nenhum medicamento foi encontrado</h2>
          <p>Tente pesquisar por outro nome comercial ou princípio ativo.</p>
        </section>
      ) : null}

      {!loading && !error && resultados.length > 0 ? (
        <section className="resultados-grid" aria-label="Lista de medicamentos encontrados">
          {resultados.map((medicamento) => (
            <ResultadoCard key={medicamento.id} medicamento={medicamento} />
          ))}
        </section>
      ) : null}
    </main>
  )
}
