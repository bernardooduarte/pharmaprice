import { useEffect, useMemo, useState } from 'react'

import { HistoricoPrecosTable } from '../components/HistoricoPrecosTable'
import { MedicamentoInfoCard } from '../components/MedicamentoInfoCard'
import { PmcPricingCard } from '../components/PmcPricingCard'
import {
  buscarComparacaoPrecos,
  buscarHistoricoPrecos,
  buscarMedicamentoDetalhe,
  buildResultadosUrl,
} from '../services/api'
import type {
  ComparacaoPrecos,
  HistoricoPreco,
  MedicamentoDetalhe,
} from '../services/api'

type DetalhesPageProps = {
  route: string
}

type DetalhesState = {
  medicamento: MedicamentoDetalhe | null
  historico: HistoricoPreco[]
  comparacao: ComparacaoPrecos | null
}

export function DetalhesPage({ route }: DetalhesPageProps) {
  const { id, uf } = useMemo(() => {
    const [pathname, queryString = ''] = route.split('?')
    const searchParams = new URLSearchParams(queryString)
    const routeId = pathname.split('/').filter(Boolean)[1] ?? ''

    return {
      id: routeId,
      uf: (searchParams.get('uf')?.trim().toUpperCase() || 'MG'),
    }
  }, [route])

  const [state, setState] = useState<DetalhesState>({
    medicamento: null,
    historico: [],
    comparacao: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function carregarDados() {
      if (!id) {
        setError('Medicamento inválido.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [medicamento, historico, comparacao] = await Promise.all([
          buscarMedicamentoDetalhe(id, uf),
          buscarHistoricoPrecos(id, uf),
          buscarComparacaoPrecos(id, uf),
        ])

        if (!isActive) {
          return
        }

        setState({
          medicamento,
          historico,
          comparacao,
        })
      } catch (requestError) {
        if (!isActive) {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Ocorreu um erro inesperado ao carregar os detalhes.',
        )
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void carregarDados()

    return () => {
      isActive = false
    }
  }, [id, uf])

  const medicamento = state.medicamento
  const comparacao = state.comparacao
  const retornoResultados = buildResultadosUrl({
    q: medicamento?.substancia ?? '',
    uf,
  })

  return (
    <main className="detalhes-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Início</a>
        <span>/</span>
        <a href={retornoResultados}>Resultados</a>
        <span>/</span>
        <span>Detalhes</span>
      </nav>

      {loading ? (
        <section className="feedback-card">
          <p className="eyebrow">Carregando</p>
          <h2>Buscando detalhes do medicamento...</h2>
          <p>Aguarde enquanto carregamos informações oficiais, histórico e comparação.</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="feedback-card feedback-card--error">
          <p className="eyebrow">Falha ao carregar</p>
          <h2>Não foi possível abrir a tela de detalhes</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {!loading && !error && medicamento && comparacao ? (
        <>
          <section className="detalhes-grid">
            <MedicamentoInfoCard medicamento={medicamento} uf={uf} pmc={comparacao.pmc} />
            <PmcPricingCard comparacao={comparacao} />
          </section>

          <HistoricoPrecosTable historico={state.historico} uf={uf} />
        </>
      ) : null}
    </main>
  )
}
