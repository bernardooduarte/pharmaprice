/**
 * Histórico local do PharmaPrice.
 *
 * Decisão de privacidade (LGPD): como o sistema ainda não possui login/autenticação,
 * o histórico de buscas e de medicamentos visitados é armazenado exclusivamente no
 * localStorage do navegador da pessoa usuária. O dado nunca trafega para o backend
 * nem é "tratado" pelo PharmaPrice como controlador — fica inteiramente sob controle
 * do dispositivo do usuário, o que evita enquadramento como dado pessoal tratado por
 * terceiro (Lei 13.709/2018, art. 5º, XI — anonimização/ausência de tratamento).
 *
 * Quando o sistema ganhar cadastro de usuário, este módulo pode ser estendido para
 * sincronizar com o backend mediante consentimento explícito, sem quebrar a API
 * pública exposta aqui (getHistorico, registrarBusca, registrarVisita, limpar*).
 */

const STORAGE_KEY = 'pharmaprice:historico:v1'
const MAX_ITEMS = 30

export type HistoricoBusca = {
  tipo: 'busca'
  id: string
  termo: string
  uf: string
  timestamp: number
}

export type HistoricoVisita = {
  tipo: 'visita'
  id: string
  medicamentoId: number
  produto: string
  substancia?: string
  uf: string
  timestamp: number
}

export type HistoricoItem = HistoricoBusca | HistoricoVisita

type HistoricoState = {
  buscas: HistoricoBusca[]
  visitas: HistoricoVisita[]
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function ler(): HistoricoState {
  if (!isBrowser()) return { buscas: [], visitas: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { buscas: [], visitas: [] }
    const parsed = JSON.parse(raw) as HistoricoState
    return {
      buscas: Array.isArray(parsed.buscas) ? parsed.buscas : [],
      visitas: Array.isArray(parsed.visitas) ? parsed.visitas : [],
    }
  } catch {
    return { buscas: [], visitas: [] }
  }
}

function salvar(state: HistoricoState) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent('pharmaprice:historico-changed'))
  } catch {
    // Quota excedida ou navegador em modo privado — falha silenciosa,
    // a navegação principal não deve quebrar por causa do histórico.
  }
}

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Registra um termo de busca. Evita duplicar a mesma busca consecutiva. */
export function registrarBusca(termo: string, uf: string) {
  const termoNormalizado = termo.trim()
  if (termoNormalizado.length < 2) return

  const state = ler()
  const jaExiste = state.buscas[0]?.termo.toLowerCase() === termoNormalizado.toLowerCase()
    && state.buscas[0]?.uf === uf

  if (jaExiste) {
    state.buscas[0].timestamp = Date.now()
  } else {
    const novaBusca: HistoricoBusca = {
      tipo: 'busca',
      id: gerarId(),
      termo: termoNormalizado,
      uf,
      timestamp: Date.now(),
    }
    state.buscas = [novaBusca, ...state.buscas.filter(
      (b) => !(b.termo.toLowerCase() === termoNormalizado.toLowerCase() && b.uf === uf)
    )].slice(0, MAX_ITEMS)
  }

  salvar(state)
}

/** Registra a visita a um medicamento (tela de detalhes). */
export function registrarVisita(params: {
  medicamentoId: number
  produto: string
  substancia?: string
  uf: string
}) {
  const state = ler()
  const novaVisita: HistoricoVisita = {
    tipo: 'visita',
    id: gerarId(),
    medicamentoId: params.medicamentoId,
    produto: params.produto,
    substancia: params.substancia,
    uf: params.uf,
    timestamp: Date.now(),
  }

  state.visitas = [
    novaVisita,
    ...state.visitas.filter((v) => v.medicamentoId !== params.medicamentoId || v.uf !== params.uf),
  ].slice(0, MAX_ITEMS)

  salvar(state)
}

/** Retorna buscas recentes (mais novo primeiro). */
export function getBuscas(): HistoricoBusca[] {
  return ler().buscas
}

/** Retorna visitas recentes (mais novo primeiro). */
export function getVisitas(): HistoricoVisita[] {
  return ler().visitas
}

/** Retorna os dois tipos combinados, ordenados por data decrescente. */
export function getHistoricoCombinado(): HistoricoItem[] {
  const state = ler()
  return [...state.buscas, ...state.visitas].sort((a, b) => b.timestamp - a.timestamp)
}

export function removerItem(id: string) {
  const state = ler()
  state.buscas = state.buscas.filter((b) => b.id !== id)
  state.visitas = state.visitas.filter((v) => v.id !== id)
  salvar(state)
}

export function limparBuscas() {
  const state = ler()
  state.buscas = []
  salvar(state)
}

export function limparVisitas() {
  const state = ler()
  state.visitas = []
  salvar(state)
}

export function limparTudo() {
  salvar({ buscas: [], visitas: [] })
}