const API_BASE_URL = 'http://127.0.0.1:8000'

export type SearchMedicamentosParams = {
  q: string
  uf: string
}

export function buildResultadosUrl(params: SearchMedicamentosParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    uf: params.uf,
  })

  return `/resultados?${searchParams.toString()}`
}

export async function searchMedicamentos(params: SearchMedicamentosParams) {
  const response = await fetch(`${API_BASE_URL}/medicamentos/?${new URLSearchParams(params)}`)

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar medicamentos.')
  }

  return response.json()
}

export { API_BASE_URL }
