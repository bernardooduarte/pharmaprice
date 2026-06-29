import type { ComparacaoPrecos } from '../services/api'

type PmcPricingCardProps = {
  comparacao: ComparacaoPrecos
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)
}

export function PmcPricingCard({ comparacao }: PmcPricingCardProps) {
  const ultimoPreco = comparacao.precos_encontrados[0] ?? null

  return (
    <aside className="pmc-pricing-card">
      <p className="eyebrow">Teto regulatório</p>
      <h2>PMC em {comparacao.uf}</h2>

      {comparacao.pmc === null ? (
        <p className="pmc-pricing-card__empty">
          PMC não disponível para a UF selecionada.
        </p>
      ) : (
        <div className="pmc-pricing-card__value-group">
          <strong>{formatCurrency(comparacao.pmc)}</strong>
          <p>Preço máximo ao consumidor para a UF selecionada.</p>
        </div>
      )}

      {ultimoPreco ? (
        <div
          className={`pmc-pricing-card__status ${
            ultimoPreco.acima_pmc ? 'is-warning' : 'is-ok'
          }`}
        >
          <h3>
            {ultimoPreco.acima_pmc
              ? 'Preço praticado acima do PMC'
              : 'Preço praticado dentro do PMC'}
          </h3>
          <p>
            Último preço registrado: {formatCurrency(ultimoPreco.preco)}
          </p>
          {ultimoPreco.diferenca_valor !== null ? (
            <p>
              Diferença: {formatCurrency(ultimoPreco.diferenca_valor)} (
              {ultimoPreco.diferenca_percentual !== null
                ? `${formatPercent(ultimoPreco.diferenca_percentual)}%`
                : 'sem percentual'}
              )
            </p>
          ) : null}
        </div>
      ) : (
        <div className="pmc-pricing-card__status is-muted">
          <h3>Sem comparação cadastrada</h3>
          <p>Ainda não há preços praticados para comparar com o PMC nesta UF.</p>
        </div>
      )}
    </aside>
  )
}
