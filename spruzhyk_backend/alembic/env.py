import asyncio
from logging.config import fileConfig
import sys
import os

# 1. Добавляем корень проекта в пути поиска, чтобы Питон видел папку `app`
sys.path.insert(0, os.getcwd())

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# 2. ИМПОРТЫ ИЗ НАШЕГО ПРОЕКТА
from app.database import DATABASE_URL
# Импортируем Base из __init__.py папки models, где уже загружены User и Order
from app.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Передаем метаданные моделей в Alembic
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = DATABASE_URL

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()