"""add name to users

Revision ID: 20260421_0004
Revises: 20260413_0003
Create Date: 2026-04-21 00:00:00.000000
"""

import sqlalchemy as sa
from alembic import op

revision = "20260421_0004"
down_revision = "20260413_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(100), nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("users", "name")
