"""drop legacy feedback table if present

Revision ID: 20260413_0003
Revises: 20260413_0002
Create Date: 2026-04-13 00:00:00.000000
"""

import sqlalchemy as sa
from alembic import op

revision = "20260413_0003"
down_revision = "20260413_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS feedback CASCADE"))


def downgrade() -> None:
    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("analysis_id", sa.Integer(), sa.ForeignKey("analyses.id"), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("analysis_id"),
    )
    op.create_index("ix_feedback_id", "feedback", ["id"], unique=False)
    op.create_index("ix_feedback_analysis_id", "feedback", ["analysis_id"], unique=False)
