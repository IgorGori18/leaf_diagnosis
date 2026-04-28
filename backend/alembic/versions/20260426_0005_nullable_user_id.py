"""make analyses.user_id nullable for guest access

Revision ID: 20260426_0005
Revises: 20260421_0004
Create Date: 2026-04-26 00:00:00.000000
"""

import sqlalchemy as sa
from alembic import op

revision = "20260426_0005"
down_revision = "20260421_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("analyses", "user_id", nullable=True)


def downgrade() -> None:
    op.alter_column("analyses", "user_id", nullable=False)
