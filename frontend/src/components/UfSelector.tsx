const UF_OPTIONS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const

type UfSelectorProps = {
  value: string
  onChange: (value: string) => void
}

export function UfSelector({ value, onChange }: UfSelectorProps) {
  return (
    <div className="uf-selector">
      <label className="uf-selector__label" htmlFor="uf-selector">
        UF de referência
      </label>
      <div className="uf-selector__control">
        <select
          id="uf-selector"
          name="uf-selector"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {UF_OPTIONS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
