"""
Modelos do banco de dados do PharmaPrice.
"""
from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, relationship


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


class Medicamento(Base):
    """
    Registro de medicamento da tabela CMED/ANVISA.
    Cada linha da planilha vira um registro aqui.
    """

    __tablename__ = "medicamentos"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Identificacao
    substancia = Column(Text, nullable=False, index=True)
    produto = Column(String(500), nullable=False, index=True)
    apresentacao = Column(String(500), nullable=False)
    laboratorio = Column(String(300))
    cnpj = Column(String(20))
    codigo_ggrem = Column(String(50), unique=True, nullable=False, index=True)
    registro = Column(String(50))
    ean1 = Column(String(20))

    # Classificacao
    classe_terapeutica = Column(String(200))
    tipo_produto = Column(String(100))
    regime_preco = Column(String(50))
    tarja = Column(String(100))

    # Precos armazenados da CMED
    pf_sem_impostos = Column(Numeric(12, 2))
    pf_0 = Column(Numeric(12, 2))
    pmc_sem_impostos = Column(Numeric(12, 2))
    pmc_0 = Column(Numeric(12, 2))

    # PMC por aliquota de ICMS
    pmc_12 = Column(Numeric(12, 2))
    pmc_17 = Column(Numeric(12, 2))
    pmc_18 = Column(Numeric(12, 2))
    pmc_19 = Column(Numeric(12, 2))
    pmc_20 = Column(Numeric(12, 2))

    # Flags
    restricao_hospitalar = Column(Boolean, default=False)
    cap = Column(Boolean, default=False)
    confaz_87 = Column(Boolean, default=False)
    icms_0 = Column(Boolean, default=False)
    comercializacao_2025 = Column(String(10))

    # Rastreabilidade
    data_coleta = Column(DateTime, nullable=False, default=utc_now)
    fonte_url = Column(Text)
    data_publicacao_cmed = Column(String(50))

    historico_precos = relationship(
        "HistoricoPreco",
        back_populates="medicamento",
        cascade="all, delete-orphan",
        order_by="desc(HistoricoPreco.data_coleta)",
    )

    __table_args__ = (
        Index("ix_medicamentos_substancia_produto", "substancia", "produto"),
    )

    def __repr__(self):
        return f"<Medicamento {self.produto} | {self.apresentacao}>"


class HistoricoPreco(Base):
    __tablename__ = "historico_precos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    medicamento_id = Column(
        Integer,
        ForeignKey("medicamentos.id", ondelete="CASCADE"),
        nullable=False,
    )
    preco = Column(Numeric(12, 2), nullable=False)
    pmc = Column(Numeric(12, 2))
    uf = Column(String(2), nullable=False)
    fonte = Column(String(255), nullable=False)
    tipo_fonte = Column(String(100), nullable=False)
    data_coleta = Column(DateTime, nullable=False, default=utc_now)
    observacao = Column(Text)
    created_at = Column(DateTime, nullable=False, default=utc_now)

    medicamento = relationship("Medicamento", back_populates="historico_precos")

    __table_args__ = (
        Index("ix_historico_precos_medicamento_id", "medicamento_id"),
        Index("ix_historico_precos_uf", "uf"),
        Index("ix_historico_precos_data_coleta", "data_coleta"),
    )

    def __repr__(self):
        return (
            f"<HistoricoPreco medicamento_id={self.medicamento_id} "
            f"uf={self.uf} preco={self.preco}>"
        )
