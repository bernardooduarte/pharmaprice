import type { HistoricoPreco } from '../services/api'

type HistoricoPrecosTableProps = {
  historico: HistoricoPreco[]
  uf: string
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'Não informado'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function HistoricoPrecosTable({ historico, uf }: HistoricoPrecosTableProps) {
  if (historico.length === 0) {
    return (
      <section className="historico-card">
        <div className="historico-card__header">
          <p className="eyebrow">Histórico de preços</p>
          <h2>Coletas registradas</h2>
        </div>
        <p className="historico-card__empty">
          Ainda não há histórico de preços cadastrado para este medicamento nesta UF.
        </p>
      </section>
    )
  }

  return (
    <section className="historico-card">
      <div className="historico-card__header">
        <p className="eyebrow">Histórico de preços</p>
        <h2>Coletas registradas em {uf}</h2>
      </div>

      <div className="historico-table-wrapper">
        <table className="historico-table">
          <thead>
            <tr>
              <th>Data de coleta</th>
              <th>Preço</th>
              <th>PMC</th>
              <th>Fonte</th>
              <th>Tipo de fonte</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((item) => (
              <tr key={item.id}>
                <td>{formatDateTime(item.data_coleta)}</td>
                <td>{formatCurrency(item.preco)}</td>
                <td>{formatCurrency(item.pmc)}</td>
                <td>{item.fonte}</td>
                <td>{item.tipo_fonte}</td>
                <td>{item.observacao ?? 'Sem observação'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
