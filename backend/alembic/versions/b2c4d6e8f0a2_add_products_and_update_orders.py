"""Add products table and update orders

Revision ID: b2c4d6e8f0a2
Revises: cafc81b9a258
Create Date: 2026-04-21 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'b2c4d6e8f0a2'
down_revision: Union[str, None] = 'cafc81b9a258'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('products',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('dealer_id', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('binding', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('spiral_colors', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('has_elastic', sa.Boolean(), nullable=True),
        sa.Column('elastic_colors', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('formats', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('cover_colors', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('retail_price', sa.Float(), nullable=True),
        sa.Column('wholesale_tiers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['dealer_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_products_dealer_id', 'products', ['dealer_id'], unique=False)

    op.add_column('orders', sa.Column('is_guest', sa.Boolean(), nullable=True, server_default='false'))
    op.alter_column('orders', 'total_price', nullable=True)
    op.alter_column('orders', 'currency', server_default='BYN')


def downgrade() -> None:
    op.drop_index('ix_products_dealer_id', table_name='products')
    op.drop_table('products')
    op.drop_column('orders', 'is_guest')
