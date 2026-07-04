import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { HistoricoPreco } from '../services/api'

type GraficoHistoricoPrecosProps = {
  historico: HistoricoPreco[]
  pmc: number | null
}

type PontosGrafico = {
  data: string
  preco: number
  fonte: string
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(dataISO: string): string {
  return new Date(dataISO).toLocaleDateString('pt-BR')
}

function tooltipFormatter(valor: unknown, nome: unknown) {
  if (nome === 'preco' && typeof valor === 'number') {
    return [formatarMoeda(valor), 'Preço']
  }
  return [String(valor ?? ''), String(nome ?? '')]
}

export function GraficoHistoricoPrecos({ historico, pmc }: GraficoHistoricoPrecosProps) {
  if (historico.length < 2) {
    return null
  }

  const pontos: PontosGrafico[] = [...historico]
    .sort((a, b) => new Date(a.data_coleta).getTime() - new Date(b.data_coleta).getTime())
    .map((item) => ({
      data: formatarData(item.data_coleta),
      preco: item.preco,
      fonte: item.fonte,
    }))

  return (
    <section className="card grafico-historico-card">
      <h3 className="card-titulo">Evolução dos preços</h3>
      <p className="grafico-historico-card__subtitulo">
        Linha do preço coletado ao longo do tempo, com referência do PMC quando disponível.
      </p>
      <div className="grafico-historico-card__chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={pontos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="data" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tickFormatter={(value) => formatarMoeda(Number(value))} width={84} stroke="#6b7280" />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(label) => `Data: ${label}`}
            />
            {pmc !== null ? (
              <ReferenceLine
                y={pmc}
                stroke="#2563eb"
                strokeDasharray="6 4"
                label={{ value: 'PMC', position: 'insideTopRight', fill: '#2563eb', fontSize: 12 }}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="preco"
              stroke="#1d4ed8"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
