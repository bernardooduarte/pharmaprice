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

export function buildResultadosUrl(params: SearchMedicamentosParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    uf: params.uf,
  })

  return `/resultados?${searchParams.toString()}`
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

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os resultados da busca.')
  }

  return response.json()
}

export { API_BASE_URL }
