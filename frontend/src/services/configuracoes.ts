const CONFIG_KEY = 'pharmaprice:configuracoes:v1'

export type ConfiguracoesSalvas = {
  uf: string
  cep: string
  raioKm: number
  preferencias: {
    generico: boolean
    similar: boolean
    referencia: boolean
  }
}

const DEFAULTS: ConfiguracoesSalvas = {
  uf: 'MG',
  cep: '',
  raioKm: 10,
  preferencias: {
    generico: true,
    similar: true,
    referencia: true,
  },
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizarConfiguracoes(config: Partial<ConfiguracoesSalvas> | null | undefined): ConfiguracoesSalvas {
  return {
    uf: (config?.uf || DEFAULTS.uf).toUpperCase(),
    cep: config?.cep ?? DEFAULTS.cep,
    raioKm: Number.isFinite(config?.raioKm) ? Number(config?.raioKm) : DEFAULTS.raioKm,
    preferencias: {
      generico: config?.preferencias?.generico ?? DEFAULTS.preferencias.generico,
      similar: config?.preferencias?.similar ?? DEFAULTS.preferencias.similar,
      referencia: config?.preferencias?.referencia ?? DEFAULTS.preferencias.referencia,
    },
  }
}

export function getConfiguracoes(): ConfiguracoesSalvas {
  if (!isBrowser()) {
    return DEFAULTS
  }

  try {
    const raw = window.localStorage.getItem(CONFIG_KEY)
    if (!raw) {
      return DEFAULTS
    }

    return normalizarConfiguracoes(JSON.parse(raw) as Partial<ConfiguracoesSalvas>)
  } catch {
    return DEFAULTS
  }
}

export function salvarConfiguracoes(config: ConfiguracoesSalvas): void {
  if (!isBrowser()) {
    return
  }

  const normalizado = normalizarConfiguracoes(config)
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizado))
  window.dispatchEvent(new CustomEvent('pharmaprice:configuracoes-changed'))
}
