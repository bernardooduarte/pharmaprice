const API_BASE_URL = 'http://127.0.0.1:8000'

export type SearchMedicamentosParams = {
  q: string
  uf: string
}

export type MedicamentoResultado = {
  id: number
  produto: string
  substancia: string
  apresentacao: string
  laboratorio: string | null
  tipo_produto: string | null
  classe_terapeutica: string | null
  pmc: number | null
  campo_pmc_usado: string
  uf: string
  data_publicacao_cmed: string | null
}

export type MedicamentoDetalhe = {
  id: number
  produto: string
  substancia: string
  apresentacao: string
  laboratorio: string | null
  cnpj: string | null
  codigo_ggrem: string
  registro: string | null
  ean1: string | null
  classe_terapeutica: string | null
  tipo_produto: string | null
  regime_preco: string | null
  tarja: string | null
  pf_sem_impostos: number | null
  pf_0: number | null
  pmc_sem_impostos: number | null
  pmc_0: number | null
  pmc_12: number | null
  pmc_17: number | null
  pmc_18: number | null
  pmc_19: number | null
  pmc_20: number | null
  fonte_url: string | null
  data_publicacao_cmed: string | null
  historico_precos_count: number
}

export type HistoricoPreco = {
  id: number
  medicamento_id: number
  preco: number
  pmc: number | null
  uf: string
  fonte: string
  tipo_fonte: string
  data_coleta: string
  observacao: string | null
  created_at: string
}

export type ComparacaoPrecoItem = {
  preco: number
  fonte: string
  tipo_fonte: string
  data_coleta: string
  acima_pmc: boolean | null
  diferenca_valor: number | null
  diferenca_percentual: number | null
}

export type ComparacaoPrecos = {
  medicamento_id: number
  produto: string
  substancia: string
  apresentacao: string
  uf: string
  pmc: number | null
  precos_encontrados: ComparacaoPrecoItem[]
}

export function buildResultadosUrl(params: SearchMedicamentosParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    uf: params.uf,
  })

  return `/resultados?${searchParams.toString()}`
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    throw new Error(fallbackMessage)
  }

  return response.json() as Promise<T>
}

export async function buscarMedicamentos(
  q: string,
  uf: string,
  limit = 20,
): Promise<MedicamentoResultado[]> {
  const searchParams = new URLSearchParams({
    q,
    uf,
    limit: String(limit),
  })

  const response = await fetch(`${API_BASE_URL}/medicamentos/?${searchParams.toString()}`)

  return parseJsonResponse<MedicamentoResultado[]>(
    response,
    'Nao foi possivel carregar os resultados da busca.',
  )
}

export async function buscarMedicamentoDetalhe(id: string, uf: string) {
  const searchParams = new URLSearchParams({ uf })
  const response = await fetch(`${API_BASE_URL}/medicamentos/${id}?${searchParams.toString()}`)

  return parseJsonResponse<MedicamentoDetalhe>(
    response,
    'Nao foi possivel carregar os dados do medicamento.',
  )
}

export async function buscarHistoricoPrecos(id: string, uf: string) {
  const searchParams = new URLSearchParams({ uf })
  const response = await fetch(
    `${API_BASE_URL}/medicamentos/${id}/historico-precos?${searchParams.toString()}`,
  )

  return parseJsonResponse<HistoricoPreco[]>(
    response,
    'Nao foi possivel carregar o historico de precos.',
  )
}

export async function buscarComparacaoPrecos(id: string, uf: string) {
  const searchParams = new URLSearchParams({ uf })
  const response = await fetch(
    `${API_BASE_URL}/medicamentos/${id}/comparacao-precos?${searchParams.toString()}`,
  )

  return parseJsonResponse<ComparacaoPrecos>(
    response,
    'Nao foi possivel carregar a comparacao com PMC.',
  )
}

export { API_BASE_URL }
