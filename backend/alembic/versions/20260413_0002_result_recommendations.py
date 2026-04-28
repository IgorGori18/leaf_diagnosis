"""add health_confidence, recommendations_text to results

Revision ID: 20260413_0002
Revises: 20260407_0001
Create Date: 2026-04-13 00:00:00.000000
"""

import sqlalchemy as sa
from alembic import op

revision = "20260413_0002"
down_revision = "20260407_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "results",
        sa.Column("health_confidence", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column("results", sa.Column("recommendations_text", sa.Text(), nullable=True))
    op.alter_column("results", "health_confidence", server_default=None)


def downgrade() -> None:
    op.drop_column("results", "recommendations_text")
    op.drop_column("results", "health_confidence")
