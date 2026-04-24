from sqlalchemy import Column, Integer, String
from core.database import Base

class Brand(Base):
    __tablename__ = "brands"

    brand_id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(255), nullable=False)
