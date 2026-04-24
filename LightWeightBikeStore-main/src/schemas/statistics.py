from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import date

#    STAFF STATISTICS   

class StaffSalesStats(BaseModel):
    """Thống kê doanh số của nhân viên"""
    staff_id: int
    staff_name: str
    total_orders: int
    total_bikes_sold: int
    total_revenue: Decimal
    
    class Config:
        from_attributes = True

class StaffSalesByPeriod(BaseModel):
    """Doanh số nhân viên theo kỳ"""
    staff_id: int
    staff_name: str
    period: str  # "2024-01" for month, "2024-01-15" for day
    total_orders: int
    total_bikes_sold: int
    total_revenue: Decimal

class StaffCountResponse(BaseModel):
    """Số lượng nhân viên"""
    total_staffs: int
    active_staffs: int
    inactive_staffs: int

#    STORE STATISTICS   

class StoreSalesByPeriod(BaseModel):
    """Doanh số cửa hàng theo kỳ"""
    period: str
    period_type: str  # "day", "month", "quarter", "year"
    total_orders: int
    total_bikes_sold: int
    total_revenue: Decimal
    avg_order_value: Decimal

class StoreOverview(BaseModel):
    """Tổng quan cửa hàng"""
    total_revenue: Decimal
    total_orders: int
    total_bikes_sold: int
    total_customers: int
    total_products: int
    avg_order_value: Decimal

#    PRODUCT STATISTICS   

class TopSellingProduct(BaseModel):
    """Sản phẩm bán chạy"""
    product_id: int
    product_name: str
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    total_quantity_sold: int
    total_revenue: Decimal
    
    class Config:
        from_attributes = True

#    CUSTOMER STATISTICS   

class TopCustomer(BaseModel):
    """Khách hàng mua nhiều"""
    customer_id: int
    customer_name: str
    email: str
    phone: Optional[str] = None
    total_orders: int
    total_bikes_bought: int
    total_spent: Decimal
    
    class Config:
        from_attributes = True

class CustomerHighestOrder(BaseModel):
    """Khách hàng có đơn hàng cao nhất"""
    customer_id: int
    customer_name: str
    email: str
    order_id: int
    order_date: date
    order_value: Decimal
    items_count: int

#    RESPONSE WRAPPERS   

class TopProductsResponse(BaseModel):
    """Response danh sách sản phẩm bán chạy"""
    products: List[TopSellingProduct]
    total_count: int

class TopCustomersResponse(BaseModel):
    """Response danh sách khách hàng top"""
    customers: List[TopCustomer]
    total_count: int

class HighestOrdersResponse(BaseModel):
    """Response danh sách đơn hàng cao nhất"""
    orders: List[CustomerHighestOrder]
    total_count: int
