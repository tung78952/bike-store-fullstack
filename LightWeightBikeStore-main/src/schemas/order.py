from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from decimal import Decimal

#    REQUEST SCHEMAS   

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    list_price: Decimal
    discount: Optional[Decimal] = Decimal("0")

class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    order_status: int  # 1=Pending, 2=Processing, 3=Rejected, 4=Completed
    order_date: date
    required_date: date
    shipped_date: Optional[date] = None
    staff_id: int
    items: Optional[List[OrderItemCreate]] = []

class OrderUpdate(BaseModel):
    customer_id: Optional[int] = None
    order_status: Optional[int] = None
    order_date: Optional[date] = None
    required_date: Optional[date] = None
    shipped_date: Optional[date] = None
    staff_id: Optional[int] = None

class OrderItemUpdate(BaseModel):
    product_id: Optional[int] = None
    quantity: Optional[int] = None
    list_price: Optional[Decimal] = None
    discount: Optional[Decimal] = None

#    RESPONSE SCHEMAS   

class OrderItemResponse(BaseModel):
    order_id: int
    item_id: int
    product_id: int
    quantity: int
    list_price: Decimal
    discount: Decimal

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    order_id: int
    customer_id: Optional[int] = None
    order_status: int
    order_date: date
    required_date: date
    shipped_date: Optional[date] = None
    staff_id: int

    class Config:
        from_attributes = True

class OrderWithItemsResponse(OrderResponse):
    items: List[OrderItemResponse] = []
