from datetime import UTC, datetime
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.models import Base, HistoricoPreco, Medicamento
from app.db.session import get_db
from app.main import app


def criar_medicamentos() -> list[Medicamento]:
    return [
        Medicamento(
            substancia="DIPIRONA MONOIDRATADA",
            produto="NOVALGINA",
            apresentacao="500 MG COM 10 COMPRIMIDOS",
            laboratorio="LAB TESTE",
            cnpj="00.000.000/0001-00",
            codigo_ggrem="000000000000001",
            classe_terapeutica="ANALGESICOS",
            tipo_produto="Referencia",
            regime_preco="Regulado",
            pmc_17=Decimal("14.50"),
            pmc_18=Decimal("15.00"),
            pmc_20=Decimal("16.20"),
            data_publicacao_cmed="10/06/2026 13h30min",
        ),
        Medicamento(
            substancia="DIPIRONA MONOIDRATADA",
            produto="DIPIRONA GENERICA",
            apresentacao="500 MG COM 10 COMPRIMIDOS",
            laboratorio="LAB TESTE 2",
            cnpj="11.111.111/0001-11",
            codigo_ggrem="000000000000002",
            classe_terapeutica="ANALGESICOS",
            tipo_produto="Genérico",
            regime_preco="Regulado",
            pmc_17=Decimal("13.80"),
            pmc_18=Decimal("14.20"),
            pmc_20=Decimal("15.10"),
            data_publicacao_cmed="10/06/2026 13h30min",
        ),
        Medicamento(
            substancia="AMOXICILINA",
            produto="AMOXICILINA 500MG",
            apresentacao="500 MG COM 21 CAPSULAS",
            laboratorio="LAB OUTRO",
            cnpj="22.222.222/0001-22",
            codigo_ggrem="000000000000003",
            classe_terapeutica="ANTIBIOTICOS",
            tipo_produto="Similar",
            regime_preco="Regulado",
            pmc_17=Decimal("25.00"),
            pmc_18=Decimal("26.00"),
            pmc_20=Decimal("28.00"),
            data_publicacao_cmed="10/06/2026 13h30min",
        ),
    ]


def configurar_cliente():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SessionTesting = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    db = SessionTesting()
    medicamentos = criar_medicamentos()
    db.add_all(medicamentos)
    db.commit()
    for medicamento in medicamentos:
        db.refresh(medicamento)

    db.add(
        HistoricoPreco(
            medicamento_id=medicamentos[0].id,
            preco=Decimal("16.00"),
            pmc=Decimal("15.00"),
            uf="MG",
            fonte="Drogaria Centro",
            tipo_fonte="farmacia",
            data_coleta=datetime.now(UTC).replace(tzinfo=None),
            observacao="Coleta manual.",
        )
    )
    db.commit()
    db.close()

    def override_get_db():
        session = SessionTesting()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client, medicamentos


def teardown_module():
    app.dependency_overrides.clear()


def test_busca_valida_retorna_lista_nao_vazia():
    client, _ = configurar_cliente()

    response = client.get("/medicamentos/?q=dipirona&uf=MG")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 1
    assert any("DIPIRONA" in item["substancia"] for item in payload)


def test_busca_com_1_caractere_retorna_422():
    client, _ = configurar_cliente()

    response = client.get("/medicamentos/?q=d&uf=MG")

    assert response.status_code == 422


def test_get_medicamento_inexistente_retorna_404():
    client, _ = configurar_cliente()

    response = client.get("/medicamentos/9999")

    assert response.status_code == 404


def test_get_equivalentes_retorna_mesma_substancia():
    client, medicamentos = configurar_cliente()

    response = client.get(f"/medicamentos/{medicamentos[0].id}/equivalentes?uf=MG")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["substancia"] == medicamentos[0].substancia
    assert payload[0]["id"] == medicamentos[1].id


def test_comparacao_precos_retorna_estrutura_corrreta():
    client, medicamentos = configurar_cliente()

    response = client.get(f"/medicamentos/{medicamentos[0].id}/comparacao-precos?uf=MG")

    assert response.status_code == 200
    payload = response.json()
    assert payload["medicamento_id"] == medicamentos[0].id
    assert payload["uf"] == "MG"
    assert "pmc" in payload
    assert isinstance(payload["precos_encontrados"], list)
    assert len(payload["precos_encontrados"]) == 1
    assert set(payload["precos_encontrados"][0].keys()) == {
        "preco",
        "fonte",
        "tipo_fonte",
        "data_coleta",
        "acima_pmc",
        "diferenca_valor",
        "diferenca_percentual",
    }
