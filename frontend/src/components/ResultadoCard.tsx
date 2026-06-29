import { PmcAlert } from './PmcAlert'
import type { MedicamentoResultado } from '../services/api'

type ResultadoCardProps = {
  medicamento: MedicamentoResultado
}

export function ResultadoCard({ medicamento }: ResultadoCardProps) {
  const detalhesUrl = `/medicamentos/${medicamento.id}?uf=${medicamento.uf}`

  return (
    <article className="resultado-card">
      <div className="resultado-card__header">
        <div className="resultado-card__eyebrow-group">
          <span className="resultado-card__tag">{medicamento.tipo_produto ?? 'Medicamento'}</span>
          <span className="resultado-card__uf">UF {medicamento.uf}</span>
        </div>
        <h2>{medicamento.produto}</h2>
        <p className="resultado-card__substancia">{medicamento.substancia}</p>
      </div>

      <PmcAlert pmc={medicamento.pmc} uf={medicamento.uf} />

      <dl className="resultado-card__details">
        <div>
          <dt>Apresentação</dt>
          <dd>{medicamento.apresentacao}</dd>
        </div>
        <div>
          <dt>Laboratório</dt>
          <dd>{medicamento.laboratorio ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{medicamento.tipo_produto ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Classe terapêutica</dt>
          <dd>{medicamento.classe_terapeutica ?? 'Não informada'}</dd>
        </div>
        <div>
          <dt>Publicação CMED</dt>
          <dd>{medicamento.data_publicacao_cmed ?? 'Não informada'}</dd>
        </div>
      </dl>

      <a className="resultado-card__link" href={detalhesUrl}>
        Ver detalhes
      </a>
    </article>
  )
}
