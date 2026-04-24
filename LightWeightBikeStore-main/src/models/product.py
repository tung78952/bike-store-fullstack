from sqlalchemy import Column, Integer, String, SmallInteger, Numeric, ForeignKey
from core.database import Base

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.brand_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    model_year = Column(SmallInteger, nullable=False)
    list_price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0)  
