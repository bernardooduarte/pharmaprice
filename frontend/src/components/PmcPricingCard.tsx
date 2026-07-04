import type { ComparacaoPrecos } from '../services/api'

interface PmcPricingCardProps {
  comparacao: ComparacaoPrecos;
}

const PmcPricingCard = ({ comparacao }: PmcPricingCardProps) => {
  const { pmc, uf, precos_encontrados } = comparacao

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
            const abaixo = p.acima_pmc === false;
            const acima = p.acima_pmc === true;
            return (
              <div key={i} className="pmc-comparacao-row">
                <span className="pmc-farmacia">{p.fonte}</span>
                <span className="pmc-preco-coletado">
                  {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {p.diferenca_valor !== null && (
                  <span className={`pmc-diff ${abaixo ? 'diff-ok' : acima ? 'diff-alerta' : ''}`}>
                    {Math.abs(p.diferenca_valor).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                    {p.diferenca_percentual !== null &&
                      ` (${Math.abs(p.diferenca_percentual).toFixed(1)}% ${abaixo ? 'abaixo' : 'acima'} do PMC)`}
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
