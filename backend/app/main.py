import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.medicamentos import router as medicamentos_router
from app.cmed.pipeline import atualizar_cmed_do_site
from app.core.config import settings
from app.db.models import Medicamento
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.cmed_auto_sync:
        asyncio.create_task(_sincronizar_cmed_em_background())
    yield


app = FastAPI(
    title="PharmaPrice API",
    description="Comparacao de precos de medicamentos com dados CMED/ANVISA",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(medicamentos_router)

# Estado em memoria da ultima sincronizacao com o site da CMED.
# A sincronizacao roda em background no startup, sem bloquear a API.
cmed_sync_status = {
    "em_andamento": False,
    "ultima_execucao_utc": None,
    "ultimo_resultado": None,
    "ultimo_erro": None,
}


async def _sincronizar_cmed_em_background() -> None:
    cmed_sync_status["em_andamento"] = True
    session = SessionLocal()
    try:
        stats = await atualizar_cmed_do_site(session)
        cmed_sync_status["ultimo_resultado"] = stats
        cmed_sync_status["ultimo_erro"] = None
        logger.info(f"Sincronizacao CMED concluida: {stats}")
    except Exception as exc:
        cmed_sync_status["ultimo_erro"] = str(exc)
        logger.error(f"Falha ao sincronizar dados da CMED: {exc}")
    finally:
        session.close()
        cmed_sync_status["em_andamento"] = False
        cmed_sync_status["ultima_execucao_utc"] = datetime.now(UTC).isoformat()


@app.get("/")
def root():
    return {"status": "ok", "versao": "0.1.0"}


@app.get("/cmed/status")
def cmed_status():
    session = SessionLocal()
    try:
        ultimo = (
            session.query(Medicamento)
            .order_by(Medicamento.data_coleta.desc())
            .first()
        )
    finally:
        session.close()

    return {
        "fonte": "ANVISA/CMED",
        "data_publicacao_cmed": ultimo.data_publicacao_cmed if ultimo else None,
        "ultima_coleta": ultimo.data_coleta.isoformat() if ultimo else None,
        "sincronizacao_automatica": cmed_sync_status,
    }
