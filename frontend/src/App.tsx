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

const App: React.FC = () => {
  const [page, setPage] = React.useState<"home" | "resultados" | "detalhes">(getPage);

  React.useEffect(() => {
    function onPopState() {
      setPage(getPage());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (page === "detalhes") return <DetalhesPage />;
  if (page === "resultados") return <ResultadosPage route={window.location.href} />;
  return <HomePage />;
};

export default App;
