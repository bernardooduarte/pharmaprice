import React from 'react'

import { Assistente } from './components/Assistente'
import { ComoFuncionaPage } from './pages/ComoFuncionaPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import DetalhesPage from './pages/DetalhesPage'
import { HistoricoPage } from './pages/HistoricoPage'
import { HomePage } from './pages/HomePage'
import { ResultadosPage } from './pages/ResultadosPage'
import { SobrePage } from './pages/SobrePage'
import { getConfiguracoes } from './services/configuracoes'

type AppPage = 'home' | 'resultados' | 'detalhes' | 'historico' | 'configuracoes' | 'como-funciona' | 'sobre'

function getPage(): AppPage {
  const path = window.location.pathname
  if (path.startsWith('/medicamentos/')) return 'detalhes'
  if (path.startsWith('/resultados')) return 'resultados'
  if (path.startsWith('/historico')) return 'historico'
  if (path.startsWith('/configuracoes')) return 'configuracoes'
  if (path.startsWith('/como-funciona')) return 'como-funciona'
  if (path.startsWith('/sobre')) return 'sobre'
  return 'home'
}

function getUf(): string {
  return new URLSearchParams(window.location.search).get('uf')?.toUpperCase() || getConfiguracoes().uf
}

const App: React.FC = () => {
  const [page, setPage] = React.useState<AppPage>(getPage)
  const [uf, setUf] = React.useState<string>(getUf)

  React.useEffect(() => {
    function onRouteChange() {
      setPage(getPage())
      setUf(getUf())
    }

    function onConfiguracoesChanged() {
      setUf(getUf())
    }

    window.addEventListener('popstate', onRouteChange)
    window.addEventListener('pharmaprice:configuracoes-changed', onConfiguracoesChanged)
    return () => {
      window.removeEventListener('popstate', onRouteChange)
      window.removeEventListener('pharmaprice:configuracoes-changed', onConfiguracoesChanged)
    }
  }, [])

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <a href="/" className="site-header__logo">PharmaPrice</a>
          <nav className="site-header__nav" aria-label="Navegação principal">
            <a href="/" className={page === 'home' ? 'is-active' : ''}>Início</a>
            <a href="/historico" className={page === 'historico' ? 'is-active' : ''}>Histórico</a>
            <a href="/como-funciona" className={page === 'como-funciona' ? 'is-active' : ''}>Como Funciona</a>
            <a href="/sobre" className={page === 'sobre' ? 'is-active' : ''}>Sobre</a>
          </nav>
          <div className="site-header__uf" aria-label={`UF selecionada: ${uf}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 1a5 5 0 0 1 5 5c0 2.648-1.768 4.864-3.223 6.232A13.31 13.31 0 0 1 8 13.5a13.31 13.31 0 0 1-1.777-1.268C4.768 10.864 3 8.648 3 6a5 5 0 0 1 5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
            </svg>
            UF: {uf}
          </div>
        </div>
      </header>

      {page === 'detalhes' && <DetalhesPage />}
      {page === 'resultados' && <ResultadosPage route={window.location.href} />}
      {page === 'historico' && <HistoricoPage />}
      {page === 'configuracoes' && <ConfiguracoesPage />}
      {page === 'como-funciona' && <ComoFuncionaPage />}
      {page === 'sobre' && <SobrePage />}
      {page === 'home' && <HomePage onNavigate={() => { setPage(getPage()); setUf(getUf()) }} />}

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__brand">PharmaPrice</span>
          <p className="site-footer__copy">© 2026 PharmaPrice. Dados baseados na tabela CMED/ANVISA.</p>
          <nav className="site-footer__links" aria-label="Links do rodapé">
            <a href="/configuracoes">Configurações</a>
            <a href="/como-funciona">Como Funciona</a>
            <a href="/sobre">Sobre</a>
            <a href="/historico">Histórico</a>
          </nav>
        </div>
      </footer>

      <Assistente />
    </>
  )
}

export default App
