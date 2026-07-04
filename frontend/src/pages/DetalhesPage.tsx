import { useEffect, useState } from 'react'

import HistoricoPrecosTable from '../components/HistoricoPrecosTable'
import MedicamentoInfoCard from '../components/MedicamentoInfoCard'
import PmcPricingCard from '../components/PmcPricingCard'
import { EquivalentesSection } from '../components/EquivalentesSection'
import { GraficoHistoricoPrecos } from '../components/GraficoHistoricoPrecos'
import {
  buscarComparacaoPrecos,
  buscarEquivalentes,
  buscarHistoricoPrecos,
  buscarMedicamentoDetalhe,
  type ComparacaoPrecos,
  type HistoricoPreco,
  type MedicamentoDetalhe,
  type MedicamentoResultado,
} from '../services/api'
import { registrarVisita } from '../services/historico'

function parseUrl(): { id: string | null; uf: string } {
  const path = window.location.pathname
  const search = new URLSearchParams(window.location.search)
  const partes = path.split('/')
  const id = partes[partes.length - 1] || null
  const uf = search.get('uf')?.toUpperCase() || 'MG'
  return { id, uf }
}

export default function DetalhesPage() {
  const { id, uf } = parseUrl()

  const [medicamento, setMedicamento] = useState<MedicamentoDetalhe | null>(null)
  const [historico, setHistorico] = useState<HistoricoPreco[]>([])
  const [comparacao, setComparacao] = useState<ComparacaoPrecos | null>(null)
  const [equivalentes, setEquivalentes] = useState<MedicamentoResultado[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setErro('ID do medicamento não encontrado na URL.')
      setCarregando(false)
      return
    }

    const medicamentoId = id
    let ativo = true

    async function carregarDados() {
      setCarregando(true)
      setErro(null)

      try {
        const [dataMed, dataHist, dataComp, dataEq] = await Promise.all([
          buscarMedicamentoDetalhe(medicamentoId, uf),
          buscarHistoricoPrecos(medicamentoId, uf),
          buscarComparacaoPrecos(medicamentoId, uf),
          buscarEquivalentes(medicamentoId, uf),
        ])

        if (!ativo) {
          return
        }

        setMedicamento(dataMed)
        setHistorico(dataHist)
        setComparacao(dataComp)
        setEquivalentes(dataEq)

        registrarVisita({
          medicamentoId: dataMed.id,
          produto: dataMed.produto,
          substancia: dataMed.substancia,
          uf,
        })
      } catch (carregarErro: unknown) {
        if (!ativo) {
          return
        }

        setErro(carregarErro instanceof Error ? carregarErro.message : 'Erro ao carregar dados.')
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    void carregarDados()

    return () => {
      ativo = false
    }
  }, [id, uf])

  function voltarResultados() {
    window.history.back()
  }

  if (carregando) {
    return (
      <div className="detalhes-container">
        <div className="detalhes-loading">
          <div className="spinner" />
          <p>Carregando dados do medicamento…</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="detalhes-container">
        <div className="detalhes-erro card">
          <p>⚠️ {erro}</p>
          <button className="btn-voltar" onClick={voltarResultados}>
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!medicamento) {
    return null
  }

  return (
    <div className="detalhes-container">
      <nav className="breadcrumb">
        <a href="/" className="breadcrumb-link">Início</a>
        <span className="breadcrumb-sep">›</span>
        <button className="breadcrumb-link breadcrumb-btn" onClick={voltarResultados}>
          Resultados
        </button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-atual">{medicamento.produto}</span>
      </nav>

      <div className="detalhes-grid">
        <div className="detalhes-col-principal">
          <MedicamentoInfoCard medicamento={medicamento} uf={uf} />
          <GraficoHistoricoPrecos historico={historico} pmc={comparacao?.pmc ?? null} />
          <HistoricoPrecosTable historico={historico} uf={uf} />
          <EquivalentesSection equivalentes={equivalentes} uf={uf} />
        </div>

        <div className="detalhes-col-lateral">
          {comparacao ? (
            <PmcPricingCard comparacao={comparacao} />
          ) : (
            <div className="card pmc-card pmc-indisponivel-card">
              <span className="pmc-badge">CMED / PMC</span>
              <p className="pmc-indisponivel">PMC não disponível para a UF selecionada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
