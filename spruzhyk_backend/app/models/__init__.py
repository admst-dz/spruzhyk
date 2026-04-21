from .user import User
from .order import Order
from app.database import Base

# Теперь, импортируя Base из этого файла, мы гарантируем,
# что SQLAlchemy "прочитает" все модели и зарегистрирует их в Base.metadata