import { useEffect, useState } from 'react'

import { getConfiguracoes, salvarConfiguracoes, type ConfiguracoesSalvas } from '../services/configuracoes'

export function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracoesSalvas>(() => getConfiguracoes())
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!salvo) {
      return
    }

    const timeout = window.setTimeout(() => setSalvo(false), 2200)
    return () => window.clearTimeout(timeout)
  }, [salvo])

  function atualizarCampo<K extends keyof ConfiguracoesSalvas>(campo: K, valor: ConfiguracoesSalvas[K]) {
    setConfig((atual) => ({ ...atual, [campo]: valor }))
  }

  function salvar() {
    salvarConfiguracoes(config)
    setSalvo(true)
  }

  return (
    <main className="page page--configuracoes">
      <section className="page-hero">
        <button type="button" className="page-back" onClick={() => window.history.back()}>
          ← Voltar
        </button>
        <p className="eyebrow">Preferências locais</p>
        <h1>Configurações</h1>
        <p className="page-hero__subtitle">
          As preferências ficam salvas apenas neste navegador, sem envio para o backend.
        </p>
      </section>

      <div className="page-grid">
        <section className="card settings-card">
          <h3 className="card-titulo">Localização e Estado</h3>
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>CEP</span>
              <input
                type="text"
                value={config.cep}
                onChange={(event) => atualizarCampo('cep', event.target.value)}
                placeholder="00000-000"
              />
            </label>
            <label className="settings-field">
              <span>UF</span>
              <select
                value={config.uf}
                onChange={(event) => atualizarCampo('uf', event.target.value)}
              >
                {[
                  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
                  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
                  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
                ].map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="card settings-card">
          <h3 className="card-titulo">Raio de busca</h3>
          <div className="settings-slider">
            <input
              type="range"
              min={1}
              max={50}
              value={config.raioKm}
              onChange={(event) => atualizarCampo('raioKm', Number(event.target.value))}
            />
            <strong>{config.raioKm} km</strong>
          </div>
        </section>

        <section className="card settings-card">
          <h3 className="card-titulo">Preferências de medicamento</h3>
          <div className="settings-checkboxes">
            {[
              ['generico', 'Genérico'],
              ['similar', 'Similar'],
              ['referencia', 'Referência'],
            ].map(([key, label]) => (
              <label key={key} className="settings-check">
                <input
                  type="checkbox"
                  checked={config.preferencias[key as keyof ConfiguracoesSalvas['preferencias']]}
                  onChange={(event) =>
                    setConfig((atual) => ({
                      ...atual,
                      preferencias: {
                        ...atual.preferencias,
                        [key]: event.target.checked,
                      },
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="card settings-card settings-card--disabled">
          <div className="settings-disabled__header">
            <h3 className="card-titulo">Monitoramento de preço</h3>
            <span className="settings-badge">EM BREVE</span>
          </div>
          <p>
            Recurso desabilitado nesta etapa do TCC. O foco permanece na comparação regulatória e no histórico local.
          </p>
        </section>
      </div>

      <div className="page-actions">
        <button type="button" className="search-panel__button" onClick={salvar}>
          Salvar configurações
        </button>
        {salvo ? <span className="settings-saved">Salvo!</span> : null}
      </div>
    </main>
  )
}
