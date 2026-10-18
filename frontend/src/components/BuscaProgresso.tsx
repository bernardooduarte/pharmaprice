import { useEffect, useState } from 'react'

const ETAPAS = [
  { limite: 8, titulo: 'Conectando ao servidor', detalhe: 'Estabelecendo conexão com a API do PharmaPrice.' },
  { limite: 45, titulo: 'Consultando a base CMED', detalhe: 'Procurando por nome comercial e princípio ativo.' },
  { limite: 80, titulo: 'Aplicando o PMC da UF', detalhe: 'Calculando o preço máximo ao consumidor para o estado.' },
  { limite: 100, titulo: 'Preparando os resultados', detalhe: 'Ordenando por relevância e montando a lista.' },
]

const SERVIDOR_LENTO_APOS_S = 6

function calcularProgresso(segundos: number): number {
  return Math.min(94, 94 * (1 - Math.exp(-segundos / 14)))
}

type BuscaProgressoProps = {
  termo: string
}

export function BuscaProgresso({ termo }: BuscaProgressoProps) {
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const inicio = performance.now()
    const id = window.setInterval(() => {
      setSegundos((performance.now() - inicio) / 1000)
    }, 200)
    return () => window.clearInterval(id)
  }, [])

  const progresso = calcularProgresso(segundos)
  const etapaAtual = ETAPAS.findIndex((etapa) => progresso < etapa.limite)
  const indice = etapaAtual === -1 ? ETAPAS.length - 1 : etapaAtual
  const servidorLento = segundos >= SERVIDOR_LENTO_APOS_S

  return (
    <section className="busca-progresso" role="status" aria-live="polite">
      <p className="eyebrow">Buscando</p>
      <h2>{`Procurando "${termo}"`}</h2>

      <div
        className="busca-progresso__barra"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progresso)}
      >
        <div className="busca-progresso__preenchimento" style={{ width: `${progresso}%` }} />
      </div>
      <p className="busca-progresso__percentual">{`${Math.round(progresso)}% · ${Math.floor(segundos)}s`}</p>

      <ol className="busca-progresso__etapas">
        {ETAPAS.map((etapa, i) => {
          const estado = i < indice ? 'concluida' : i === indice ? 'ativa' : 'pendente'
          return (
            <li key={etapa.titulo} className={`busca-progresso__etapa busca-progresso__etapa--${estado}`}>
              <span className="busca-progresso__marcador" aria-hidden="true">
                {estado === 'concluida' ? '✓' : i + 1}
              </span>
              <span className="busca-progresso__texto">
                <strong>{etapa.titulo}</strong>
                {estado === 'ativa' ? <small>{etapa.detalhe}</small> : null}
              </span>
            </li>
          )
        })}
      </ol>

      {servidorLento ? (
        <p className="busca-progresso__aviso">
          O servidor estava em modo de espera e está acordando. A primeira busca pode levar até
          1 minuto; as próximas serão rápidas.
        </p>
      ) : null}
    </section>
  )
}
