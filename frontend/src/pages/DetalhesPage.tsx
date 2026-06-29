import React, { useEffect, useState } from "react";
import MedicamentoInfoCard from "../components/MedicamentoInfoCard";
import PmcPricingCard from "../components/PmcPricingCard";
import HistoricoPrecosTable from "../components/HistoricoPrecosTable";

const API_BASE = "http://127.0.0.1:8000";

interface Medicamento {
  id: number;
  produto: string;
  substancia: string;
  apresentacao: string;
  laboratorio?: string;
  tipo_produto?: string;
  classe_terapeutica?: string;
  data_publicacao?: string;
}

interface HistoricoPreco {
  id: number;
  farmacia: string;
  preco: number;
  uf: string;
  coletado_em: string;
  fonte?: string;
}

interface ComparacaoPrecos {
  medicamento_id: number;
  produto: string;
  uf: string;
  pmc: number | null;
  precos_encontrados: {
    farmacia: string;
    preco: number;
    diferenca_pmc: number | null;
    percentual_pmc: number | null;
    coletado_em: string;
  }[];
}

// Extrair id e uf da URL sem depender de react-router
function parseUrl(): { id: string | null; uf: string } {
  const path = window.location.pathname; // /medicamentos/123
  const search = new URLSearchParams(window.location.search);
  const partes = path.split("/");
  const id = partes[partes.length - 1] || null;
  const uf = search.get("uf") || "MG";
  return { id, uf };
}

const DetalhesPage: React.FC = () => {
  const { id, uf } = parseUrl();

  const [medicamento, setMedicamento] = useState<Medicamento | null>(null);
  const [historico, setHistorico] = useState<HistoricoPreco[]>([]);
  const [comparacao, setComparacao] = useState<ComparacaoPrecos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErro("ID do medicamento não encontrado na URL.");
      setCarregando(false);
      return;
    }

    async function carregarDados() {
      setCarregando(true);
      setErro(null);
      try {
        const [resMed, resHist, resComp] = await Promise.all([
          fetch(`${API_BASE}/medicamentos/${id}`),
          fetch(`${API_BASE}/medicamentos/${id}/historico-precos?uf=${uf}`),
          fetch(`${API_BASE}/medicamentos/${id}/comparacao-precos?uf=${uf}`),
        ]);

        if (!resMed.ok) throw new Error(`Medicamento não encontrado (HTTP ${resMed.status})`);

        const [dataMed, dataHist, dataComp] = await Promise.all([
          resMed.json(),
          resHist.ok ? resHist.json() : [],
          resComp.ok ? resComp.json() : null,
        ]);

        setMedicamento(dataMed);
        setHistorico(Array.isArray(dataHist) ? dataHist : []);
        setComparacao(dataComp);
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar dados.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id, uf]);

  function voltarResultados() {
    window.history.back();
  }

  if (carregando) {
    return (
      <div className="detalhes-container">
        <div className="detalhes-loading">
          <div className="spinner" />
          <p>Carregando dados do medicamento…</p>
        </div>
      </div>
    );
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
    );
  }

  if (!medicamento) return null;

  return (
    <div className="detalhes-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/" className="breadcrumb-link">Início</a>
        <span className="breadcrumb-sep">›</span>
        <button className="breadcrumb-link breadcrumb-btn" onClick={voltarResultados}>
          Resultados
        </button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-atual">{medicamento.produto}</span>
      </nav>

      {/* Layout principal */}
      <div className="detalhes-grid">
        {/* Coluna esquerda — info principal */}
        <div className="detalhes-col-principal">
          <MedicamentoInfoCard medicamento={medicamento} uf={uf} />
          <HistoricoPrecosTable historico={historico} uf={uf} />
        </div>

        {/* Coluna direita — PMC */}
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
  );
};

export default DetalhesPage;
