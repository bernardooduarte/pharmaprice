"""
Script de importacao inicial da tabela CMED.
Uso: python -m app.cmed.importar <caminho_do_arquivo.xlsx>
"""
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import settings

logging.basicConfig(level=logging.INFO)

def main():
    if len(sys.argv) < 2:
        print("Uso: python -m app.cmed.importar <arquivo.xlsx>")
        sys.exit(1)

    caminho = sys.argv[1]
    print(f"Lendo arquivo: {caminho}")

    from app.cmed.pipeline import parsear_arquivo_local, salvar_no_banco

    medicamentos, data_pub = parsear_arquivo_local(caminho)
    print(f"Parsed: {len(medicamentos)} medicamentos (publicacao: {data_pub})")

    engine = create_engine(settings.database_url, pool_pre_ping=True)
    with Session(engine) as session:
        stats = salvar_no_banco(
            session,
            medicamentos,
            data_publicacao=data_pub,
            fonte_url="https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos",
        )

    print(f"Concluido: {stats}")

if __name__ == "__main__":
    main()
