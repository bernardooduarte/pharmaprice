from fastapi import FastAPI
from app.api.medicamentos import router as medicamentos_router

app = FastAPI(
    title="PharmaPrice API",
    description="Comparação de preços de medicamentos com dados CMED/ANVISA",
    version="0.1.0",
)

app.include_router(medicamentos_router)

@app.get("/")
def root():
    return {"status": "ok", "versao": "0.1.0"}

@app.get("/cmed/status")
def cmed_status():
    return {"fonte": "ANVISA/CMED", "data_publicacao": "10/06/2026 13h30min"}