"""Add telegram_id to users

Revision ID: d4f7a9c1b2e3
Revises: 0a3df10ebd37
Create Date: 2026-04-24 20:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = 'd4f7a9c1b2e3'
down_revision = '0a3df10ebd37'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('telegram_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_telegram_id'), 'users', ['telegram_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_telegram_id'), table_name='users')
    op.drop_column('users', 'telegram_id')
