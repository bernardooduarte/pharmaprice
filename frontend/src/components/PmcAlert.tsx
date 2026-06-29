type PmcAlertProps = {
  pmc: number | null
  uf: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function PmcAlert({ pmc, uf }: PmcAlertProps) {
  if (pmc === null) {
    return (
      <div className="pmc-alert pmc-alert--muted">
        <span className="pmc-alert__label">PMC</span>
        <strong>Não disponível</strong>
        <p>Não há valor de PMC publicado para a UF {uf} neste registro.</p>
      </div>
    )
  }

  return (
    <div className="pmc-alert">
      <span className="pmc-alert__label">PMC em {uf}</span>
      <strong>{formatCurrency(pmc)}</strong>
      <p>Preço máximo ao consumidor com base na referência regulatória vigente.</p>
    </div>
  )
}
