import React from "react";

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

interface PmcPricingCardProps {
  comparacao: ComparacaoPrecos;
}

const PmcPricingCard: React.FC<PmcPricingCardProps> = ({ comparacao }) => {
  const { pmc, uf, precos_encontrados } = comparacao;

  return (
    <div className="card pmc-card">
      <div className="pmc-header">
        <span className="pmc-badge">CMED / PMC</span>
        <span className="pmc-uf">UF: {uf}</span>
      </div>

      {pmc !== null ? (
        <div className="pmc-valor-wrapper">
          <span className="pmc-valor">
            {pmc.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          <span className="pmc-descricao">Teto máximo ao consumidor</span>
        </div>
      ) : (
        <p className="pmc-indisponivel">
          PMC não disponível para a UF selecionada.
        </p>
      )}

      {precos_encontrados.length > 0 && (
        <div className="pmc-comparacoes">
          <h4 className="pmc-comparacoes-titulo">Preços coletados</h4>
          {precos_encontrados.map((p, i) => {
            const abaixo = p.diferenca_pmc !== null && p.diferenca_pmc < 0;
            const acima = p.diferenca_pmc !== null && p.diferenca_pmc > 0;
            return (
              <div key={i} className="pmc-comparacao-row">
                <span className="pmc-farmacia">{p.farmacia}</span>
                <span className="pmc-preco-coletado">
                  {p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                {p.diferenca_pmc !== null && (
                  <span className={`pmc-diff ${abaixo ? "diff-ok" : acima ? "diff-alerta" : ""}`}>
                    {abaixo ? "▼" : "▲"}{" "}
                    {Math.abs(p.diferenca_pmc).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    {p.percentual_pmc !== null &&
                      ` (${Math.abs(p.percentual_pmc).toFixed(1)}% ${abaixo ? "abaixo" : "acima"} do PMC)`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PmcPricingCard;
