import { useEffect, useState } from 'react'
import {
  getHistoricoCombinado,
  removerItem,
  limparTudo,
  type HistoricoItem,
} from '../services/historico'
import { buildResultadosUrl } from '../services/api'

function formatarData(timestamp: number): string {
  const data = new Date(timestamp)
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)

  const mesmoDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (mesmoDay(data, hoje)) return `Hoje, ${hora}`
  if (mesmoDay(data, ontem)) return `Ontem, ${hora}`
  return `${data.toLocaleDateString('pt-BR')}, ${hora}`
}

function navegar(url: string) {
  window.history.pushState({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function HistoricoPage() {
  const [itens, setItens] = useState<HistoricoItem[]>([])

  useEffect(() => {
    function carregar() {
      setItens(getHistoricoCombinado())
    }
    carregar()
    window.addEventListener('pharmaprice:historico-changed', carregar)
    return () => window.removeEventListener('pharmaprice:historico-changed', carregar)
  }, [])

  function handleRemover(id: string) {
    removerItem(id)
  }

  function handleLimparTudo() {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
      limparTudo()
    }
  }

  function handleClickItem(item: HistoricoItem) {
    if (item.tipo === 'busca') {
      navegar(buildResultadosUrl({ q: item.termo, uf: item.uf }))
    } else {
      navegar(`/medicamentos/${item.medicamentoId}?uf=${item.uf}`)
    }
  }

  return (
    <main className="historico-page">
      <section className="historico-hero">
        <p className="eyebrow">Seu histórico</p>
        <h1>Buscas e medicamentos recentes</h1>
        <p className="historico-hero__subtitle">
          Tudo aqui fica salvo apenas neste navegador — nenhuma informação é
          enviada para nossos servidores. Você pode remover itens individualmente
          ou limpar tudo a qualquer momento.
        </p>
      </section>

      {itens.length === 0 ? (
        <div className="feedback-card">
          <h2>Nenhum histórico ainda</h2>
          <p>Suas buscas e os medicamentos que você visitar vão aparecer aqui.</p>
          <a href="/" className="resultado-card__link" style={{ marginTop: '1rem', display: 'inline-flex', padding: '0 1.5rem' }}>
            Fazer uma busca
          </a>
        </div>
      ) : (
        <>
          <div className="historico-toolbar">
            <span className="historico-toolbar__count">
              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
            </span>
            <button className="historico-toolbar__clear" onClick={handleLimparTudo}>
              Limpar histórico
            </button>
          </div>

          <ul className="historico-list">
            {itens.map((item) => (
              <li key={item.id} className="historico-list__item">
                <button
                  className="historico-list__main"
                  onClick={() => handleClickItem(item)}
                >
                  <span className={`historico-list__badge historico-list__badge--${item.tipo}`}>
                    {item.tipo === 'busca' ? 'Busca' : 'Visitado'}
                  </span>
                  <span className="historico-list__content">
                    <span className="historico-list__title">
                      {item.tipo === 'busca' ? item.termo : item.produto}
                    </span>
                    <span className="historico-list__meta">
                      {item.tipo === 'visita' && item.substancia ? `${item.substancia} · ` : ''}
                      UF {item.uf} · {formatarData(item.timestamp)}
                    </span>
                  </span>
                </button>
                <button
                  className="historico-list__remove"
                  onClick={() => handleRemover(item.id)}
                  aria-label={`Remover ${item.tipo === 'busca' ? item.termo : item.produto} do histórico`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}