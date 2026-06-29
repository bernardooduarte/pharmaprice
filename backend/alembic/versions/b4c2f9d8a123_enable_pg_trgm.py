"""enable pg_trgm

Revision ID: b4c2f9d8a123
Revises: ae2d6c514125
Create Date: 2026-06-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b4c2f9d8a123"
down_revision: Union[str, None] = "ae2d6c514125"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
