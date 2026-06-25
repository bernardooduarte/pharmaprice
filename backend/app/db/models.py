"""
Modelos do banco de dados — PharmaPrice
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Numeric, DateTime,
    Text, Index, Boolean
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Medicamento(Base):
    """
    Registro de medicamento da tabela CMED/ANVISA.
    Cada linha da planilha vira um registro aqui.
    """
    __tablename__ = "medicamentos"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Identificação
    substancia = Column(String(500), nullable=False, index=True)
    produto = Column(String(500), nullable=False, index=True)
    apresentacao = Column(String(500), nullable=False)
    laboratorio = Column(String(300))
    cnpj = Column(String(20))
    codigo_ggrem = Column(String(50), unique=True, nullable=False, index=True)
    registro = Column(String(50))
    ean1 = Column(String(20))

    # Classificação
    classe_terapeutica = Column(String(200))
    tipo_produto = Column(String(100))   # Referência, Genérico, Similar, Biológico...
    regime_preco = Column(String(50))    # Regulado / Liberado
    tarja = Column(String(100))

    # Preços — armazenamos os principais
    pf_sem_impostos = Column(Numeric(12, 2))
    pf_0 = Column(Numeric(12, 2))
    pmc_sem_impostos = Column(Numeric(12, 2))
    pmc_0 = Column(Numeric(12, 2))

    # PMC por alíquota de ICMS — colunas mais comuns por estado
    pmc_12 = Column(Numeric(12, 2))    # AC, AL, CE, DF, ES, GO, MS, MT, PA, PI, RN, RO, RR, RS, SC, SE, TO
    pmc_17 = Column(Numeric(12, 2))    # AM, AP, BA, MA, MG (alguns), PB, PE, PR, RJ, SP
    pmc_18 = Column(Numeric(12, 2))    # MG (maioria), RS (alguns)
    pmc_19 = Column(Numeric(12, 2))
    pmc_20 = Column(Numeric(12, 2))    # RJ (alguns)

    # Flags
    restricao_hospitalar = Column(Boolean, default=False)
    cap = Column(Boolean, default=False)
    confaz_87 = Column(Boolean, default=False)
    icms_0 = Column(Boolean, default=False)
    comercializacao_2025 = Column(String(10))

    # Rastreabilidade
    data_coleta = Column(DateTime, nullable=False, default=datetime.utcnow)
    fonte_url = Column(Text)
    data_publicacao_cmed = Column(String(50))  # ex: "10/06/2026 13h30min"

    # Índices para busca
    __table_args__ = (
        Index("ix_medicamentos_substancia_produto", "substancia", "produto"),
    )

    def __repr__(self):
        return f"<Medicamento {self.produto} | {self.apresentacao}>"
