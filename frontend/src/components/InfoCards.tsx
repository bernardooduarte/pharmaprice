const cards = [
  {
    title: 'Dados Oficiais',
    description:
      'Consulte preços máximos regulatórios com base nas referências oficiais da CMED e no PMC vigente.',
  },
  {
    title: 'Comparação Ágil',
    description:
      'Pesquise rapidamente por nome comercial ou princípio ativo e compare valores em poucos segundos.',
  },
  {
    title: 'Histórico de Preços',
    description:
      'Acompanhe a evolução dos preços praticados e tenha mais contexto para avaliar cada medicamento.',
  },
] as const

export function InfoCards() {
  return (
    <section className="info-section" aria-label="Recursos do PharmaPrice">
      <div className="info-section__header">
        <p className="eyebrow">Recursos principais</p>
        <h2>Informações úteis para comparar preços com mais segurança</h2>
      </div>

      <div className="info-grid">
        {cards.map((card, index) => (
          <article key={card.title} className="info-card">
            <div className="info-card__badge" aria-hidden="true">
              0{index + 1}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
