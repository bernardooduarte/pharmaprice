export function SobrePage() {
  return (
    <main className="page">
      <section className="page-hero page-hero--centered">
        <p className="eyebrow">Projeto acadêmico</p>
        <h1>Sobre</h1>
        <p className="page-hero__subtitle">
          O PharmaPrice é um TCC do Bacharelado em Sistemas de Informação do IFSEMG Campus Juiz de Fora.
        </p>
      </section>

      <section className="page-grid page-grid--single">
        <article className="card">
          <h3 className="card-titulo">Origem do projeto</h3>
          <p>
            Desenvolvido como Trabalho de Conclusão de Curso em 2026, com foco em transparência de preços e uso de dados regulatórios.
          </p>
        </article>
        <article className="card">
          <h3 className="card-titulo">Equipe</h3>
          <p>Bernardo Oliveira Duarte, desenvolvedor.</p>
          <p>Prof. Emerson Augusto Priamo Moraes, orientador.</p>
        </article>
        <article className="card">
          <h3 className="card-titulo">Dados e privacidade</h3>
          <p>
            A fonte dos preços é a tabela CMED/ANVISA, atualizada periodicamente. O histórico de navegação e configurações fica apenas no navegador, sem cadastro obrigatório.
          </p>
        </article>
      </section>
    </main>
  )
}
