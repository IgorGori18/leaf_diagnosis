"""init schema

Revision ID: 20260407_0001
Revises:
Create Date: 2026-04-07 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260407_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_index("ix_users_id", "users", ["id"], unique=False)

    op.create_table(
        "analyses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("image_path", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_analyses_id", "analyses", ["id"], unique=False)
    op.create_index("ix_analyses_user_id", "analyses", ["user_id"], unique=False)

    op.create_table(
        "results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("analysis_id", sa.Integer(), sa.ForeignKey("analyses.id"), nullable=False),
        sa.Column("plant_name", sa.String(length=255), nullable=False),
        sa.Column("plant_confidence", sa.Float(), nullable=False),
        sa.Column("health_status", sa.String(length=50), nullable=False),
        sa.Column("llm_response_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("analysis_id"),
    )
    op.create_index("ix_results_id", "results", ["id"], unique=False)
    op.create_index("ix_results_analysis_id", "results", ["analysis_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_results_analysis_id", table_name="results")
    op.drop_index("ix_results_id", table_name="results")
    op.drop_table("results")

    op.drop_index("ix_analyses_user_id", table_name="analyses")
    op.drop_index("ix_analyses_id", table_name="analyses")
    op.drop_table("analyses")

    op.drop_index("ix_users_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
