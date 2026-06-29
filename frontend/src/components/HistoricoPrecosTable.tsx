import React from "react";

interface HistoricoPreco {
  id: number;
  farmacia: string;
  preco: number;
  uf: string;
  coletado_em: string;
  fonte?: string;
}

interface HistoricoPrecosTableProps {
  historico: HistoricoPreco[];
  uf: string;
}

const HistoricoPrecosTable: React.FC<HistoricoPrecosTableProps> = ({ historico, uf }) => {
  if (historico.length === 0) {
    return (
      <div className="card historico-card historico-vazio">
        <h3 className="card-titulo">Histórico de preços</h3>
        <p className="historico-vazio-msg">
          Ainda não há histórico de preços cadastrado para este medicamento nesta UF ({uf}).
        </p>
      </div>
    );
  }

  return (
    <div className="card historico-card">
      <h3 className="card-titulo">Histórico de preços — {uf}</h3>
      <div className="historico-table-wrapper">
        <table className="historico-table">
          <thead>
            <tr>
              <th>Farmácia</th>
              <th>Preço</th>
              <th>UF</th>
              <th>Data coleta</th>
              <th>Fonte</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((h) => (
              <tr key={h.id}>
                <td>{h.farmacia}</td>
                <td className="td-preco">
                  {h.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td>{h.uf}</td>
                <td>{new Date(h.coletado_em).toLocaleDateString("pt-BR")}</td>
                <td>{h.fonte || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricoPrecosTable;
