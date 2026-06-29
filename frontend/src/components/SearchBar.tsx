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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
        </span>
        <input
          id="medicamento-search"
          name="medicamento-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por nome comercial ou princípio ativo"
          autoComplete="off"
        />
      </div>
      <p className={`search-field__hint ${error ? 'is-visible' : ''}`}>
        {error ?? 'Digite ao menos 2 caracteres para buscar.'}
      </p>
    </div>
  )
}
