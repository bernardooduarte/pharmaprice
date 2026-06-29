import type { MedicamentoDetalhe } from '../services/api'

type MedicamentoInfoCardProps = {
  medicamento: MedicamentoDetalhe
  uf: string
  pmc: number | null
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'Não disponível'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function MedicamentoInfoCard({
  medicamento,
  uf,
  pmc,
}: MedicamentoInfoCardProps) {
  return (
    <section className="medicamento-info-card">
      <div className="medicamento-info-card__header">
        <div className="medicamento-info-card__badges">
          <span className="resultado-card__tag">
            {medicamento.tipo_produto ?? 'Medicamento'}
          </span>
          <span className="resultado-card__uf">UF {uf}</span>
        </div>
        <h1>{medicamento.produto}</h1>
        <p className="medicamento-info-card__subtitle">{medicamento.substancia}</p>
      </div>

      <div className="medicamento-info-card__summary">
        <div>
          <span className="medicamento-info-card__label">Apresentação</span>
          <strong>{medicamento.apresentacao}</strong>
        </div>
        <div>
          <span className="medicamento-info-card__label">Laboratório</span>
          <strong>{medicamento.laboratorio ?? 'Não informado'}</strong>
        </div>
        <div>
          <span className="medicamento-info-card__label">PMC</span>
          <strong>{formatCurrency(pmc)}</strong>
        </div>
      </div>

      <dl className="medicamento-info-card__details">
        <div>
          <dt>Classe terapêutica</dt>
          <dd>{medicamento.classe_terapeutica ?? 'Não informada'}</dd>
        </div>
        <div>
          <dt>Regime de preço</dt>
          <dd>{medicamento.regime_preco ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Tarja</dt>
          <dd>{medicamento.tarja ?? 'Não informada'}</dd>
        </div>
        <div>
          <dt>Registro</dt>
          <dd>{medicamento.registro ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Código GGREM</dt>
          <dd>{medicamento.codigo_ggrem}</dd>
        </div>
        <div>
          <dt>EAN</dt>
          <dd>{medicamento.ean1 ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Publicação CMED</dt>
          <dd>{medicamento.data_publicacao_cmed ?? 'Não informada'}</dd>
        </div>
        <div>
          <dt>Fonte oficial</dt>
          <dd>{medicamento.fonte_url ?? 'Não informada'}</dd>
        </div>
      </dl>
    </section>
  )
}
