from datetime import UTC, datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.db.models import HistoricoPreco, Medicamento
from app.db.session import get_db

router = APIRouter(prefix="/medicamentos", tags=["medicamentos"])

PMC_POR_UF = {
    "AC": "pmc_12",
    "AL": "pmc_12",
    "AM": "pmc_17",
    "AP": "pmc_17",
    "BA": "pmc_17",
    "CE": "pmc_12",
    "DF": "pmc_12",
    "ES": "pmc_12",
    "GO": "pmc_12",
    "MA": "pmc_17",
    "MG": "pmc_18",
    "MS": "pmc_12",
    "MT": "pmc_12",
    "PA": "pmc_12",
    "PB": "pmc_17",
    "PE": "pmc_17",
    "PI": "pmc_12",
    "PR": "pmc_17",
    "RJ": "pmc_20",
    "RN": "pmc_12",
    "RO": "pmc_12",
    "RR": "pmc_12",
    "RS": "pmc_12",
    "SC": "pmc_12",
    "SE": "pmc_12",
    "SP": "pmc_17",
    "TO": "pmc_12",
}


class MedicamentoResumoResponse(BaseModel):
    id: int
    produto: str
    substancia: str
    apresentacao: str
    laboratorio: Optional[str] = None
    tipo_produto: Optional[str] = None
    classe_terapeutica: Optional[str] = None
    pmc: Optional[float] = None
    campo_pmc_usado: str
    uf: str
    data_publicacao_cmed: Optional[str] = None


class MedicamentoDetalheResponse(BaseModel):
    id: int
    produto: str
    substancia: str
    apresentacao: str
    laboratorio: Optional[str] = None
    cnpj: Optional[str] = None
    codigo_ggrem: str
    registro: Optional[str] = None
    ean1: Optional[str] = None
    classe_terapeutica: Optional[str] = None
    tipo_produto: Optional[str] = None
    regime_preco: Optional[str] = None
    tarja: Optional[str] = None
    pf_sem_impostos: Optional[float] = None
    pf_0: Optional[float] = None
    pmc_sem_impostos: Optional[float] = None
    pmc_0: Optional[float] = None
    pmc_12: Optional[float] = None
    pmc_17: Optional[float] = None
    pmc_18: Optional[float] = None
    pmc_19: Optional[float] = None
    pmc_20: Optional[float] = None
    fonte_url: Optional[str] = None
    data_publicacao_cmed: Optional[str] = None
    historico_precos_count: int


class HistoricoPrecoCreateRequest(BaseModel):
    preco: Decimal = Field(..., gt=0)
    pmc: Optional[Decimal] = Field(default=None, gt=0)
    uf: str = Field(..., min_length=2, max_length=2)
    fonte: str = Field(..., min_length=2, max_length=255)
    tipo_fonte: str = Field(..., min_length=2, max_length=100)
    data_coleta: Optional[datetime] = None
    observacao: Optional[str] = None


class HistoricoPrecoResponse(BaseModel):
    id: int
    medicamento_id: int
    preco: float
    pmc: Optional[float] = None
    uf: str
    fonte: str
    tipo_fonte: str
    data_coleta: datetime
    observacao: Optional[str] = None
    created_at: datetime


class ComparacaoPrecoItemResponse(BaseModel):
    preco: float
    fonte: str
    tipo_fonte: str
    data_coleta: datetime
    acima_pmc: Optional[bool] = None
    diferenca_valor: Optional[float] = None
    diferenca_percentual: Optional[float] = None


class ComparacaoPrecosResponse(BaseModel):
    medicamento_id: int
    produto: str
    substancia: str
    apresentacao: str
    uf: str
    pmc: Optional[float] = None
    precos_encontrados: list[ComparacaoPrecoItemResponse]


def _to_float(value: Optional[Decimal]) -> Optional[float]:
    return float(value) if value is not None else None


def _campo_pmc_por_uf(uf: str) -> str:
    return PMC_POR_UF.get(uf.upper(), "pmc_18")


def _pmc_do_medicamento(medicamento: Medicamento, uf: str) -> Optional[Decimal]:
    campo_pmc = _campo_pmc_por_uf(uf)
    return getattr(medicamento, campo_pmc)


def _buscar_medicamento_ou_404(db: Session, medicamento_id: int) -> Medicamento:
    medicamento = db.get(Medicamento, medicamento_id)
    if medicamento is None:
        raise HTTPException(status_code=404, detail="Medicamento nao encontrado")
    return medicamento


def _serializar_historico(historico: HistoricoPreco) -> HistoricoPrecoResponse:
    return HistoricoPrecoResponse(
        id=historico.id,
        medicamento_id=historico.medicamento_id,
        preco=float(historico.preco),
        pmc=_to_float(historico.pmc),
        uf=historico.uf,
        fonte=historico.fonte,
        tipo_fonte=historico.tipo_fonte,
        data_coleta=historico.data_coleta,
        observacao=historico.observacao,
        created_at=historico.created_at,
    )


@router.get("/", response_model=list[MedicamentoResumoResponse])
def buscar_medicamentos(
    q: str = Query(..., min_length=2, description="Nome comercial ou principio ativo"),
    uf: str = Query("MG", description="UF para selecao do PMC"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    campo_pmc = _campo_pmc_por_uf(uf)

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
        MedicamentoResumoResponse(
            id=m.id,
            produto=m.produto,
            substancia=m.substancia,
            apresentacao=m.apresentacao,
            laboratorio=m.laboratorio,
            tipo_produto=m.tipo_produto,
            classe_terapeutica=m.classe_terapeutica,
            pmc=_to_float(getattr(m, campo_pmc)),
            campo_pmc_usado=campo_pmc,
            uf=uf.upper(),
            data_publicacao_cmed=m.data_publicacao_cmed,
        )
        for m in resultados
    ]


@router.get("/{medicamento_id}", response_model=MedicamentoDetalheResponse)
def detalhar_medicamento(
    medicamento_id: int,
    db: Session = Depends(get_db),
):
    medicamento = _buscar_medicamento_ou_404(db, medicamento_id)

    return MedicamentoDetalheResponse(
        id=medicamento.id,
        produto=medicamento.produto,
        substancia=medicamento.substancia,
        apresentacao=medicamento.apresentacao,
        laboratorio=medicamento.laboratorio,
        cnpj=medicamento.cnpj,
        codigo_ggrem=medicamento.codigo_ggrem,
        registro=medicamento.registro,
        ean1=medicamento.ean1,
        classe_terapeutica=medicamento.classe_terapeutica,
        tipo_produto=medicamento.tipo_produto,
        regime_preco=medicamento.regime_preco,
        tarja=medicamento.tarja,
        pf_sem_impostos=_to_float(medicamento.pf_sem_impostos),
        pf_0=_to_float(medicamento.pf_0),
        pmc_sem_impostos=_to_float(medicamento.pmc_sem_impostos),
        pmc_0=_to_float(medicamento.pmc_0),
        pmc_12=_to_float(medicamento.pmc_12),
        pmc_17=_to_float(medicamento.pmc_17),
        pmc_18=_to_float(medicamento.pmc_18),
        pmc_19=_to_float(medicamento.pmc_19),
        pmc_20=_to_float(medicamento.pmc_20),
        fonte_url=medicamento.fonte_url,
        data_publicacao_cmed=medicamento.data_publicacao_cmed,
        historico_precos_count=len(medicamento.historico_precos),
    )


@router.get(
    "/{medicamento_id}/historico-precos",
    response_model=list[HistoricoPrecoResponse],
)
def listar_historico_precos(
    medicamento_id: int,
    uf: str | None = Query(
        default=None,
        min_length=2,
        max_length=2,
        description="UF opcional para filtrar o historico, por exemplo MG",
    ),
    db: Session = Depends(get_db),
):
    _buscar_medicamento_ou_404(db, medicamento_id)

    query = (
        db.query(HistoricoPreco)
        .filter(HistoricoPreco.medicamento_id == medicamento_id)
        .order_by(HistoricoPreco.data_coleta.desc(), HistoricoPreco.id.desc())
    )

    if uf:
        query = query.filter(HistoricoPreco.uf == uf.upper())

    return [_serializar_historico(item) for item in query.all()]


@router.post(
    "/{medicamento_id}/historico-precos",
    response_model=HistoricoPrecoResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_historico_preco(
    medicamento_id: int,
    payload: HistoricoPrecoCreateRequest,
    db: Session = Depends(get_db),
):
    medicamento = _buscar_medicamento_ou_404(db, medicamento_id)
    uf = payload.uf.upper()
    pmc = payload.pmc if payload.pmc is not None else _pmc_do_medicamento(medicamento, uf)

    historico = HistoricoPreco(
        medicamento_id=medicamento.id,
        preco=payload.preco,
        pmc=pmc,
        uf=uf,
        fonte=payload.fonte,
        tipo_fonte=payload.tipo_fonte,
        data_coleta=payload.data_coleta or datetime.now(UTC).replace(tzinfo=None),
        observacao=payload.observacao,
    )
    db.add(historico)
    db.commit()
    db.refresh(historico)

    return _serializar_historico(historico)


@router.get(
    "/{medicamento_id}/comparacao-precos",
    response_model=ComparacaoPrecosResponse,
)
def comparar_precos(
    medicamento_id: int,
    uf: str = Query("MG", min_length=2, max_length=2),
    db: Session = Depends(get_db),
):
    medicamento = _buscar_medicamento_ou_404(db, medicamento_id)
    uf = uf.upper()
    pmc_referencia = _pmc_do_medicamento(medicamento, uf)

    historicos = (
        db.query(HistoricoPreco)
        .filter(
            HistoricoPreco.medicamento_id == medicamento_id,
            HistoricoPreco.uf == uf,
        )
        .order_by(HistoricoPreco.data_coleta.desc(), HistoricoPreco.id.desc())
        .all()
    )

    precos_encontrados = []
    for historico in historicos:
        pmc_item = historico.pmc if historico.pmc is not None else pmc_referencia
        acima_pmc = None
        diferenca_valor = None
        diferenca_percentual = None

        if pmc_item is not None:
            acima_pmc = historico.preco > pmc_item
            diferenca = historico.preco - pmc_item
            diferenca_valor = float(diferenca)
            if pmc_item != 0:
                diferenca_percentual = float((diferenca / pmc_item) * 100)

        precos_encontrados.append(
            ComparacaoPrecoItemResponse(
                preco=float(historico.preco),
                fonte=historico.fonte,
                tipo_fonte=historico.tipo_fonte,
                data_coleta=historico.data_coleta,
                acima_pmc=acima_pmc,
                diferenca_valor=diferenca_valor,
                diferenca_percentual=diferenca_percentual,
            )
        )

    return ComparacaoPrecosResponse(
        medicamento_id=medicamento.id,
        produto=medicamento.produto,
        substancia=medicamento.substancia,
        apresentacao=medicamento.apresentacao,
        uf=uf,
        pmc=_to_float(pmc_referencia),
        precos_encontrados=precos_encontrados,
    )
