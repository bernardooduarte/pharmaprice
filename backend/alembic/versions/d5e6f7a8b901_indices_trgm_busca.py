"""indices trigram para busca de medicamentos

Revision ID: d5e6f7a8b901
Revises: c1d2e3f4a567
Create Date: 2026-10-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "d5e6f7a8b901"
down_revision: Union[str, None] = "c1d2e3f4a567"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_medicamentos_produto_trgm "
        "ON medicamentos USING gin (produto gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_medicamentos_substancia_trgm "
        "ON medicamentos USING gin (substancia gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_medicamentos_substancia_trgm")
    op.execute("DROP INDEX IF EXISTS ix_medicamentos_produto_trgm")
