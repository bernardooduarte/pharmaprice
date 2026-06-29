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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--blue-600)" }}>
              <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2 6a6 6 0 1 1 10.174 4.31c-.203.196-.381.404-.553.614a11.642 11.642 0 0 1-.449.5.75.75 0 1 1-1.118-1.002 10.147 10.147 0 0 0 .39-.436c.2-.247.415-.504.65-.744A6 6 0 0 1 2 6Z" clipRule="evenodd" />
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
