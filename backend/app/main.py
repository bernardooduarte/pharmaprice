from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.medicamentos import router as medicamentos_router

app = FastAPI(
    title="PharmaPrice API",
    description="Comparacao de precos de medicamentos com dados CMED/ANVISA",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(medicamentos_router)


@app.get("/")
def root():
    return {"status": "ok", "versao": "0.1.0"}


@app.get("/cmed/status")
def cmed_status():
    return {"fonte": "ANVISA/CMED", "data_publicacao": "10/06/2026 13h30min"}
