from sqlalchemy import Column, Integer, Numeric, ForeignKey
from core.database import Base

class OrderItem(Base):
    __tablename__ = "order_items"

    order_id = Column(Integer, ForeignKey("orders.order_id"), primary_key=True)
    item_id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    list_price = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(4, 2), nullable=False, default=0)
