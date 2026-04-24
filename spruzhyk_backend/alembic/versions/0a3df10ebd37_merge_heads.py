"""merge heads

Revision ID: 0a3df10ebd37
Revises: a1b2c3d4e5f6, c3d5e7f9a1b3
Create Date: 2026-04-24 08:39:45.756203

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0a3df10ebd37'
down_revision: Union[str, None] = ('a1b2c3d4e5f6', 'c3d5e7f9a1b3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
