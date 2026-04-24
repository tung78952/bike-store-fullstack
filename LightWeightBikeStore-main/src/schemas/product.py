from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

# REQUEST SCHEMAS
class ProductCreate(BaseModel):
    product_name: str
    brand_id: int
    category_id: int
    model_year: int
    list_price: Decimal  # Giá VNĐ (dùng Decimal để tránh sai số float)
    stock: Optional[int] = 0

class ProductUpdate(BaseModel):
    # Các trường tùy chọn: chỉ cập nhật trường có gửi
    product_name: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    model_year: Optional[int] = None
    list_price: Optional[Decimal] = None
    stock: Optional[int] = None

# RESPONSE SCHEMAS
class ProductResponse(BaseModel):
    product_id: int
    product_name: str
    brand_id: int
    category_id: int
    model_year: int
    list_price: Decimal
    stock: Optional[int] = 0

    class Config:
        from_attributes = True  
