from datetime import UTC, datetime, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.models import Base, HistoricoPreco, Medicamento
from app.db.session import get_db
from app.main import app


def criar_medicamento_base() -> Medicamento:
    return Medicamento(
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
    )


def configurar_cliente():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SessionTesting = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    db = SessionTesting()
    medicamento = criar_medicamento_base()
    db.add(medicamento)
    db.commit()
    db.refresh(medicamento)

    medicamento_id = medicamento.id

    historicos = [
        HistoricoPreco(
            medicamento_id=medicamento_id,
            preco=Decimal("14.00"),
            pmc=Decimal("15.00"),
            uf="MG",
            fonte="Drogaria Centro",
            tipo_fonte="farmacia",
            data_coleta=datetime.now(UTC).replace(tzinfo=None) - timedelta(days=3),
            observacao="Coleta presencial.",
        ),
        HistoricoPreco(
            medicamento_id=medicamento_id,
            preco=Decimal("16.00"),
            pmc=Decimal("15.00"),
            uf="MG",
            fonte="Marketplace Farma",
            tipo_fonte="e-commerce",
            data_coleta=datetime.now(UTC).replace(tzinfo=None) - timedelta(days=1),
            observacao="Preco online.",
        ),
    ]
    db.add_all(historicos)
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
    return client, medicamento_id


def teardown_module():
    app.dependency_overrides.clear()


def test_get_medicamento_detalhe():
    client, medicamento_id = configurar_cliente()

    response = client.get(f"/medicamentos/{medicamento_id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["produto"] == "NOVALGINA"
    assert payload["historico_precos_count"] == 2
    assert payload["pmc_18"] == 15.0


def test_get_e_post_historico_precos():
    client, medicamento_id = configurar_cliente()

    response_get = client.get(f"/medicamentos/{medicamento_id}/historico-precos")
    assert response_get.status_code == 200
    assert len(response_get.json()) == 2

    response_post = client.post(
        f"/medicamentos/{medicamento_id}/historico-precos",
        json={
            "preco": 14.8,
            "uf": "mg",
            "fonte": "Aplicativo Farmacia",
            "tipo_fonte": "app",
            "observacao": "Preco com cashback.",
        },
    )

    assert response_post.status_code == 201
    payload_post = response_post.json()
    assert payload_post["uf"] == "MG"
    assert payload_post["pmc"] == 15.0

    response_get_atualizado = client.get(
        f"/medicamentos/{medicamento_id}/historico-precos?uf=MG"
    )
    assert response_get_atualizado.status_code == 200
    assert len(response_get_atualizado.json()) == 3


def test_get_comparacao_precos():
    client, medicamento_id = configurar_cliente()

    response = client.get(f"/medicamentos/{medicamento_id}/comparacao-precos?uf=MG")

    assert response.status_code == 200
    payload = response.json()
    assert payload["medicamento_id"] == medicamento_id
    assert payload["pmc"] == 15.0
    assert len(payload["precos_encontrados"]) == 2
    assert payload["precos_encontrados"][0]["acima_pmc"] is True
    assert payload["precos_encontrados"][0]["diferenca_valor"] == 1.0
