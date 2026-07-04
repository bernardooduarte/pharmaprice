export function ComoFuncionaPage() {
  return (
    <main className="page">
      <section className="page-hero page-hero--centered">
        <p className="eyebrow">Guia rápido</p>
        <h1>Como Funciona</h1>
        <p className="page-hero__subtitle">
          O PharmaPrice foi desenhado para simplificar a consulta de preços regulatórios e apoiar a comparação com o PMC.
        </p>
      </section>

      <section className="page-steps">
        {[
          ['1', 'Buscar', 'Digite o nome do medicamento ou princípio ativo e selecione a UF de referência.'],
          ['2', 'Ver PMC', 'Confira se existe PMC publicado e compare o teto regulatório com a lista de resultados.'],
          ['3', 'Abrir detalhes', 'Na tela de detalhes você vê histórico, gráfico de evolução e equivalentes.'],
          ['4', 'Comparar', 'Use os dados apresentados para avaliar diferença de preço e variação ao longo do tempo.'],
        ].map(([numero, titulo, texto]) => (
          <article key={numero} className="card step-card">
            <span className="step-card__numero">{numero}</span>
            <h3>{titulo}</h3>
            <p>{texto}</p>
          </article>
        ))}
      </section>

      <section className="card notice-card">
        <h3>Uso educativo</h3>
        <p>
          O sistema não substitui consulta médica ou farmacêutica. Ele serve como apoio didático e regulatório.
        </p>
      </section>

      <div className="page-actions page-actions--centered">
        <a className="search-panel__button" href="/">
          Fazer uma busca
        </a>
      </div>
    </main>
  )
}
