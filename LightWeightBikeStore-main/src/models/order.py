from sqlalchemy import Column, Integer, SmallInteger, Date, ForeignKey
from core.database import Base

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    order_status = Column(SmallInteger, nullable=False)  # 1=Pending, 2=Processing, etc.
    order_date = Column(Date, nullable=False)
    required_date = Column(Date, nullable=False)
    shipped_date = Column(Date)
    staff_id = Column(Integer, ForeignKey("staffs.staff_id"), nullable=False)
