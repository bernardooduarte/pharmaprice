import React from "react";
import DetalhesPage from "./pages/DetalhesPage";

// Roteamento manual mínimo — sem react-router
function getPage(): "home" | "resultados" | "detalhes" {
  const path = window.location.pathname;
  if (path.startsWith("/medicamentos/")) return "detalhes";
  if (path.startsWith("/resultados")) return "resultados";
  return "home";
}

// Importação lazy das outras páginas para não quebrar
// (assumindo que HomePage e ResultadosPage já existem no projeto)
// Se os nomes ou caminhos forem diferentes, ajuste aqui.
let HomePage: React.ComponentType | null = null;
let ResultadosPage: React.ComponentType | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  HomePage = require("./pages/HomePage").default;
} catch {
  // página ainda não existe
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ResultadosPage = require("./pages/ResultadosPage").default;
} catch {
  // página ainda não existe
}

const App: React.FC = () => {
  const page = getPage();

  if (page === "detalhes") return <DetalhesPage />;
  if (page === "resultados" && ResultadosPage) return <ResultadosPage />;
  if (HomePage) return <HomePage />;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>PharmaPrice</h1>
      <p>Página não encontrada: {window.location.pathname}</p>
      <a href="/">Ir para o início</a>
    </div>
  );
};

export default App;
