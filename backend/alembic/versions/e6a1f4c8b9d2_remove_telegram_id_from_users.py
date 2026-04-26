"""Remove telegram_id from users

Revision ID: e6a1f4c8b9d2
Revises: d4f7a9c1b2e3
Create Date: 2026-04-25 11:00:00.000000
"""

from alembic import op


revision = 'e6a1f4c8b9d2'
down_revision = 'd4f7a9c1b2e3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index(op.f('ix_users_telegram_id'), table_name='users')
    op.drop_column('users', 'telegram_id')


def downgrade() -> None:
    from alembic import op
    import sqlalchemy as sa

    op.add_column('users', sa.Column('telegram_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_telegram_id'), 'users', ['telegram_id'], unique=True)
