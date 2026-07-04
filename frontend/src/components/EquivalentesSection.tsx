import type { MedicamentoResultado } from '../services/api'

type EquivalentesSectionProps = {
  equivalentes: MedicamentoResultado[]
  uf: string
}

export function EquivalentesSection({ equivalentes, uf }: EquivalentesSectionProps) {
  if (equivalentes.length === 0) {
    return null
  }

  return (
    <section className="equivalentes-section card">
      <h3 className="card-titulo">Equivalentes</h3>
      <div className="equivalentes-grid">
        {equivalentes.map((medicamento) => (
          <a
            key={medicamento.id}
            className="equivalentes-card"
            href={`/medicamentos/${medicamento.id}?uf=${uf}`}
          >
            <div className="equivalentes-card__topo">
              <span className="equivalentes-card__badge">
                {medicamento.tipo_produto ?? 'Medicamento'}
              </span>
              <span className="equivalentes-card__pmc">
                {medicamento.pmc !== null
                  ? medicamento.pmc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'PMC não publicado'}
              </span>
            </div>
            <strong className="equivalentes-card__titulo">{medicamento.produto}</strong>
            <span className="equivalentes-card__subtitulo">{medicamento.apresentacao}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
