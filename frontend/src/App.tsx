import React from "react";
import { HomePage } from "./pages/HomePage";
import { ResultadosPage } from "./pages/ResultadosPage";
import DetalhesPage from "./pages/DetalhesPage";

function getPage(): "home" | "resultados" | "detalhes" {
  const path = window.location.pathname;
  if (path.startsWith("/medicamentos/")) return "detalhes";
  if (path.startsWith("/resultados")) return "resultados";
  return "home";
}

function getUf(): string {
  return new URLSearchParams(window.location.search).get("uf") || "MG";
}

const App: React.FC = () => {
  const [page, setPage] = React.useState<"home" | "resultados" | "detalhes">(getPage);
  const [uf, setUf] = React.useState<string>(getUf);

  React.useEffect(() => {
    function onPopState() {
      setPage(getPage());
      setUf(getUf());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <a href="/" className="site-header__logo">PharmaPrice</a>
          <nav className="site-header__nav" aria-label="Navegação principal">
            <a href="/" className={page === "home" ? "is-active" : ""}>Início</a>
            <a href="#">Histórico</a>
            <a href="#">Como Funciona</a>
            <a href="#">Sobre</a>
          </nav>
          <div className="site-header__uf" aria-label={`UF selecionada: ${uf}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 1a5 5 0 0 1 5 5c0 2.648-1.768 4.864-3.223 6.232A13.31 13.31 0 0 1 8 13.5a13.31 13.31 0 0 1-1.777-1.268C4.768 10.864 3 8.648 3 6a5 5 0 0 1 5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
            </svg>
            UF: {uf}
          </div>
        </div>
      </header>

      {page === "detalhes"   && <DetalhesPage />}
      {page === "resultados" && <ResultadosPage route={window.location.href} />}
      {page === "home"       && <HomePage onNavigate={() => { setPage(getPage()); setUf(getUf()); }} />}

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__brand">PharmaPrice</span>
          <p className="site-footer__copy">© 2026 PharmaPrice. Dados baseados na tabela CMED/ANVISA.</p>
          <nav className="site-footer__links" aria-label="Links do rodapé">
            <a href="#">Privacidade</a>
            <a href="#">Termos de Uso</a>
            <a href="#">Contato</a>
            <a href="#">FAQ</a>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default App;
