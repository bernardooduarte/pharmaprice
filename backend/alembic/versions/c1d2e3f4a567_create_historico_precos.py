"""create historico_precos

Revision ID: c1d2e3f4a567
Revises: b4c2f9d8a123
Create Date: 2026-06-29 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1d2e3f4a567"
down_revision: Union[str, None] = "b4c2f9d8a123"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "historico_precos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("medicamento_id", sa.Integer(), nullable=False),
        sa.Column("preco", sa.Numeric(12, 2), nullable=False),
        sa.Column("pmc", sa.Numeric(12, 2), nullable=True),
        sa.Column("uf", sa.String(length=2), nullable=False),
        sa.Column("fonte", sa.String(length=255), nullable=False),
        sa.Column("tipo_fonte", sa.String(length=100), nullable=False),
        sa.Column("data_coleta", sa.DateTime(), nullable=False),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["medicamento_id"],
            ["medicamentos.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_historico_precos_medicamento_id",
        "historico_precos",
        ["medicamento_id"],
        unique=False,
    )
    op.create_index(
        "ix_historico_precos_uf",
        "historico_precos",
        ["uf"],
        unique=False,
    )
    op.create_index(
        "ix_historico_precos_data_coleta",
        "historico_precos",
        ["data_coleta"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_historico_precos_data_coleta", table_name="historico_precos")
    op.drop_index("ix_historico_precos_uf", table_name="historico_precos")
    op.drop_index("ix_historico_precos_medicamento_id", table_name="historico_precos")
    op.drop_table("historico_precos")
