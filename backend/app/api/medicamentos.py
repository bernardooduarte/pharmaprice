from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.db.session import get_db
from app.db.models import Medicamento

router = APIRouter(prefix="/medicamentos", tags=["medicamentos"])

# Mapa de UF para nome do atributo no modelo
PMC_POR_UF = {
    "MG": "pmc_18",
    "SP": "pmc_17",
    "RJ": "pmc_20",
    "RS": "pmc_12",
    "SC": "pmc_12",
    "PR": "pmc_17",
}

@router.get("/")
def buscar_medicamentos(
    q: str = Query(..., min_length=2, description="Nome comercial ou principio ativo"),
    uf: str = Query("MG", description="UF para selecao do PMC"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    campo_pmc = PMC_POR_UF.get(uf.upper(), "pmc_18")

    resultados = (
        db.query(Medicamento)
        .filter(
            or_(
                func.similarity(Medicamento.substancia, q) > 0.2,
                func.similarity(Medicamento.produto, q) > 0.2,
                Medicamento.substancia.ilike(f"%{q}%"),
                Medicamento.produto.ilike(f"%{q}%"),
            )
        )
        .order_by(
            func.greatest(
                func.similarity(Medicamento.produto, q),
                func.similarity(Medicamento.substancia, q),
            ).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "id": m.id,
            "produto": m.produto,
            "substancia": m.substancia,
            "apresentacao": m.apresentacao,
            "laboratorio": m.laboratorio,
            "tipo_produto": m.tipo_produto,
            "classe_terapeutica": m.classe_terapeutica,
            "pmc": float(getattr(m, campo_pmc)) if getattr(m, campo_pmc) is not None else None,
            "campo_pmc_usado": campo_pmc,
            "uf": uf.upper(),
            "data_publicacao_cmed": m.data_publicacao_cmed,
        }
        for m in resultados
    ]