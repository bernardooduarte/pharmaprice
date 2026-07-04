import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type Mensagem = {
  autor: 'user' | 'bot'
  texto: string
}

const SUGESTOES = [
  'O que é PMC?',
  'Como interpretar o histórico?',
  'Esse preço está caro?',
  'O que é medicamento genérico?',
]

function responderMensagem(texto: string): string {
  const normalizado = texto.toLowerCase()

  if (normalizado.includes('pmc')) {
    return 'PMC é o Preço Máximo ao Consumidor definido pela CMED/ANVISA. Ele serve como teto regulatório para comparação de preços.'
  }

  if (normalizado.includes('genérico')) {
    return 'Medicamento genérico tem a mesma substância ativa do medicamento de referência e costuma ter preço menor.'
  }

  if (normalizado.includes('histórico')) {
    return 'O histórico mostra os preços coletados ao longo do tempo. Isso ajuda a identificar tendências e variações em relação ao PMC.'
  }

  if (normalizado.includes('caro') || normalizado.includes('preço')) {
    return 'Compare o valor coletado com o PMC exibido em cada resultado. Se estiver acima do PMC, o preço está fora do teto regulatório.'
  }

  return 'Não tenho informação específica sobre isso. Consulte um farmacêutico.'
}

export function Assistente() {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      autor: 'bot',
      texto: 'Olá. Posso explicar conceitos básicos sobre o PharmaPrice e sobre o PMC.',
    },
  ])
  const [input, setInput] = useState('')
  const mensagensRef = useRef<HTMLDivElement>(null)

  const sugestoes = useMemo(() => SUGESTOES, [])

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight
    }
  }, [mensagens])

  function enviarMensagem(texto: string) {
    const mensagem = texto.trim()
    if (!mensagem) {
      return
    }

    setMensagens((atual) => [
      ...atual,
      { autor: 'user', texto: mensagem },
      { autor: 'bot', texto: responderMensagem(mensagem) },
    ])
    setInput('')
    setAberto(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    enviarMensagem(input)
  }

  return (
    <>
      <button
        type="button"
        className="assistente-fab"
        onClick={() => setAberto((valor) => !valor)}
        aria-label={aberto ? 'Fechar assistente' : 'Abrir assistente'}
      >
        ?
      </button>

      <aside className={`assistente ${aberto ? 'is-open' : ''}`} aria-label="Assistente PharmaPrice">
        <div className="assistente__disclaimer">
          Conteúdo educativo. Não substitua orientação profissional.
        </div>
        <header className="assistente__header">
          <div>
            <p className="assistente__eyebrow">Assistente PharmaPrice</p>
            <h3>Perguntas frequentes</h3>
          </div>
          <button type="button" className="assistente__close" onClick={() => setAberto(false)}>
            ×
          </button>
        </header>

        <div className="assistente__mensagens" ref={mensagensRef}>
          {mensagens.map((mensagem, indice) => (
            <div key={`${mensagem.autor}-${indice}`} className={`assistente__mensagem assistente__mensagem--${mensagem.autor}`}>
              {mensagem.texto}
            </div>
          ))}
        </div>

        <div className="assistente__sugestoes" aria-label="Sugestões de perguntas">
          {sugestoes.map((sugestao) => (
            <button key={sugestao} type="button" onClick={() => enviarMensagem(sugestao)}>
              {sugestao}
            </button>
          ))}
        </div>

        <form className="assistente__form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Digite sua pergunta"
            aria-label="Perguntar ao assistente"
          />
          <button type="submit">Enviar</button>
        </form>
      </aside>
    </>
  )
}
