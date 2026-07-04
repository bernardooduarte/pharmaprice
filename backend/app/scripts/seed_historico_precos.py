"""
Seed demonstrativo para historico de precos.

Uso:
python -m app.scripts.seed_historico_precos
"""
from datetime import UTC, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import or_

from app.db.models import HistoricoPreco, Medicamento
from app.db.session import SessionLocal

SEMENTES = [
    {
        "termo": "DIPIRONA",
        "uf": "MG",
        "registros": [
            {
                "preco": Decimal("12.49"),
                "fonte": "Drogaria Exemplo Centro",
                "tipo_fonte": "farmacia",
                "dias_atras": 10,
                "observacao": "Preco promocional em loja fisica.",
            },
            {
                "preco": Decimal("13.90"),
                "fonte": "Marketplace Farma",
                "tipo_fonte": "e-commerce",
                "dias_atras": 4,
                "observacao": "Preco praticado no canal online.",
            },
        ],
    },
    {
        "termo": "LOSARTANA",
        "uf": "SP",
        "registros": [
            {
                "preco": Decimal("22.80"),
                "fonte": "Rede Popular Saude",
                "tipo_fonte": "farmacia",
                "dias_atras": 8,
                "observacao": "Levantamento manual de TCC.",
            },
            {
                "preco": Decimal("24.10"),
                "fonte": "App Farma Popular",
                "tipo_fonte": "app",
                "dias_atras": 2,
                "observacao": "Preco com retirada em loja.",
            },
        ],
    },
    {
        "termo": "ROSUVASTATINA",
        "uf": "MG",
        "registros": [
            {
                "preco": Decimal("58.90"),
                "fonte": "Drogaria Bairro Sul",
                "tipo_fonte": "farmacia",
                "dias_atras": 6,
                "observacao": "Preco regular sem desconto.",
            },
            {
                "preco": Decimal("61.50"),
                "fonte": "Farmacia Online Brasil",
                "tipo_fonte": "e-commerce",
                "dias_atras": 1,
                "observacao": "Preco online sem frete incluso.",
            },
        ],
    },
    {
        "termo": "ATORVASTATINA",
        "uf": "MG",
        "registros": [
            {
                "multiplicador": Decimal("0.85"),
                "fonte": "Drogaria Jardim",
                "tipo_fonte": "farmacia",
                "dias_atras": 15,
                "observacao": "Preco abaixo do PMC para demonstracao.",
            },
            {
                "multiplicador": Decimal("0.98"),
                "fonte": "Farma Cidade",
                "tipo_fonte": "e-commerce",
                "dias_atras": 8,
                "observacao": "Preco proximo ao PMC vigente.",
            },
            {
                "multiplicador": Decimal("1.08"),
                "fonte": "Drogaria Central",
                "tipo_fonte": "farmacia",
                "dias_atras": 2,
                "observacao": "Preco acima do PMC para comparacao.",
            },
        ],
    },
    {
        "termo": "METFORMINA",
        "uf": "SP",
        "registros": [
            {
                "multiplicador": Decimal("0.85"),
                "fonte": "Rede Bem Estar",
                "tipo_fonte": "farmacia",
                "dias_atras": 15,
                "observacao": "Preco abaixo do PMC para demonstracao.",
            },
            {
                "multiplicador": Decimal("0.98"),
                "fonte": "Farma Popular SP",
                "tipo_fonte": "app",
                "dias_atras": 8,
                "observacao": "Preco proximo ao PMC vigente.",
            },
            {
                "multiplicador": Decimal("1.08"),
                "fonte": "Drogaria Paulista",
                "tipo_fonte": "farmacia",
                "dias_atras": 2,
                "observacao": "Preco acima do PMC para comparacao.",
            },
        ],
    },
    {
        "termo": "OMEPRAZOL",
        "uf": "MG",
        "registros": [
            {
                "multiplicador": Decimal("0.85"),
                "fonte": "Farma Centro Sul",
                "tipo_fonte": "farmacia",
                "dias_atras": 15,
                "observacao": "Preco abaixo do PMC para demonstracao.",
            },
            {
                "multiplicador": Decimal("0.98"),
                "fonte": "App Saude MG",
                "tipo_fonte": "e-commerce",
                "dias_atras": 8,
                "observacao": "Preco proximo ao PMC vigente.",
            },
            {
                "multiplicador": Decimal("1.08"),
                "fonte": "Drogaria Horizonte",
                "tipo_fonte": "farmacia",
                "dias_atras": 2,
                "observacao": "Preco acima do PMC para comparacao.",
            },
        ],
    },
    {
        "termo": "AMOXICILINA",
        "uf": "RJ",
        "registros": [
            {
                "multiplicador": Decimal("0.85"),
                "fonte": "Drogaria Carioca",
                "tipo_fonte": "farmacia",
                "dias_atras": 15,
                "observacao": "Preco abaixo do PMC para demonstracao.",
            },
            {
                "multiplicador": Decimal("0.98"),
                "fonte": "Farma Online RJ",
                "tipo_fonte": "e-commerce",
                "dias_atras": 8,
                "observacao": "Preco proximo ao PMC vigente.",
            },
            {
                "multiplicador": Decimal("1.08"),
                "fonte": "Farmacia da Praia",
                "tipo_fonte": "farmacia",
                "dias_atras": 2,
                "observacao": "Preco acima do PMC para comparacao.",
            },
        ],
    },
]

PMC_POR_UF = {
    "MG": "pmc_18",
    "SP": "pmc_17",
    "RJ": "pmc_20",
}


def buscar_medicamento_por_termo(db, termo: str) -> Medicamento | None:
    return (
        db.query(Medicamento)
        .filter(
            or_(
                Medicamento.substancia.ilike(f"%{termo}%"),
                Medicamento.produto.ilike(f"%{termo}%"),
            )
        )
        .order_by(Medicamento.id.asc())
        .first()
    )


def calcular_preco(pmc: Decimal, multiplicador: Decimal) -> Decimal:
    return (pmc * multiplicador).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def main() -> None:
    db = SessionLocal()
    inseridos = 0

    try:
        for semente in SEMENTES:
            medicamento = buscar_medicamento_por_termo(db, semente["termo"])
            if medicamento is None:
                print(f"Nenhum medicamento encontrado para '{semente['termo']}'.")
                continue

            campo_pmc = PMC_POR_UF.get(semente["uf"], "pmc_18")
            pmc = getattr(medicamento, campo_pmc)

            if pmc is None:
                print(
                    f"PMC ausente para {medicamento.produto}/{semente['uf']}, pulando seed."
                )
                continue

            ja_existe = (
                db.query(HistoricoPreco)
                .filter(
                    HistoricoPreco.medicamento_id == medicamento.id,
                    HistoricoPreco.uf == semente["uf"],
                )
                .first()
            )
            if ja_existe:
                print(f"Seed ja existe para {medicamento.produto}/{semente['uf']}, pulando.")
                continue

            for registro in semente["registros"]:
                if "preco" in registro:
                    preco_final = registro["preco"]
                else:
                    preco_final = calcular_preco(Decimal(pmc), registro["multiplicador"])

                historico = HistoricoPreco(
                    medicamento_id=medicamento.id,
                    preco=preco_final,
                    pmc=pmc,
                    uf=semente["uf"],
                    fonte=registro["fonte"],
                    tipo_fonte=registro["tipo_fonte"],
                    data_coleta=(
                        datetime.now(UTC).replace(tzinfo=None)
                        - timedelta(days=registro["dias_atras"])
                    ),
                    observacao=registro["observacao"],
                )
                db.add(historico)
                inseridos += 1

            print(
                f"Historico demonstrativo preparado para {medicamento.produto} "
                f"(id={medicamento.id}, uf={semente['uf']})."
            )

        db.commit()
        print(f"Seed concluido com {inseridos} registros inseridos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
