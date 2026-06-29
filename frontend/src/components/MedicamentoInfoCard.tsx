import React from "react";

interface Medicamento {
  id: number;
  produto: string;
  substancia: string;
  apresentacao: string;
  laboratorio?: string;
  tipo_produto?: string;
  classe_terapeutica?: string;
  data_publicacao_cmed?: string;
}

interface MedicamentoInfoCardProps {
  medicamento: Medicamento;
  uf: string;
}

function labelValor(label: string, valor: string | undefined) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-valor">{valor || <em className="nao-disponivel">Não informado</em>}</span>
    </div>
  );
}

const MedicamentoInfoCard: React.FC<MedicamentoInfoCardProps> = ({ medicamento, uf }) => {
  return (
    <div className="card info-card">
      <h2 className="card-titulo">{medicamento.produto}</h2>
      <div className="info-grid">
        {labelValor("Substância", medicamento.substancia)}
        {labelValor("Apresentação", medicamento.apresentacao)}
        {labelValor("Laboratório", medicamento.laboratorio)}
        {labelValor("Tipo de produto", medicamento.tipo_produto)}
        {labelValor("Classe terapêutica", medicamento.classe_terapeutica)}
        {labelValor("UF selecionada", uf)}
        {labelValor(
          "Data de publicação CMED",
          medicamento.data_publicacao_cmed || undefined
        )}
      </div>
    </div>
  );
};

export default MedicamentoInfoCard;
