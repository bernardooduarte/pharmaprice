const UF_OPTIONS = ['MG', 'SP', 'RJ', 'PR', 'RS', 'SC'] as const

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
