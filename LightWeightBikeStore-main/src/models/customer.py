from sqlalchemy import Column, Integer, String
from core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    phone = Column(String(25))
    email = Column(String(255), nullable=False)
    street = Column(String(255))
    city = Column(String(50))
    state = Column(String(25))
    zip_code = Column(String(5))


