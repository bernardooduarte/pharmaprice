type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function SearchBar({ value, onChange, error }: SearchBarProps) {
  return (
    <div className="search-field">
      <label className="search-field__label" htmlFor="medicamento-search">
        Buscar medicamento
      </label>
      <div className={`search-field__control ${error ? 'is-invalid' : ''}`}>
        <span className="search-field__icon" aria-hidden="true">
          +
        </span>
        <input
          id="medicamento-search"
          name="medicamento-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar medicamento por nome ou princípio ativo"
          autoComplete="off"
        />
      </div>
      <p className={`search-field__hint ${error ? 'is-visible' : ''}`}>
        {error ?? 'Digite ao menos 2 caracteres para buscar.'}
      </p>
    </div>
  )
}
