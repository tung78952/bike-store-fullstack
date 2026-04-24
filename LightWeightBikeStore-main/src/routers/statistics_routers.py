from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from core.database import get_db
from models.staff import Staff
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.brand import Brand
from models.category import Category
from models.customer import Customer
from schemas.statistics import (
    StaffCountResponse,
    StaffSalesStats,
    StaffSalesByPeriod,
    StoreSalesByPeriod,
    StoreOverview,
    TopSellingProduct,
    TopProductsResponse,
    TopCustomer,
    TopCustomersResponse,
    CustomerHighestOrder,
    HighestOrdersResponse
)
from middleware.auth import require_admin
from services.statistics_service import StatisticsService

router = APIRouter(prefix="/api/statistics", tags=["Statistics"])

#  STAFF STATISTICS  

@router.get("/staffs/count", response_model=StaffCountResponse)
def get_staff_count(
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    THỐNG KÊ SỐ LƯỢNG NHÂN VIÊN
    
    Trả về tổng số, số active và inactive
    """
    return StatisticsService.get_staff_count(db)

@router.get("/staffs/sales", response_model=List[StaffSalesStats])
def get_staff_sales(
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    THỐNG KÊ DOANH SỐ TẤT CẢ NHÂN VIÊN
    
    Bao gồm: số đơn hàng, số xe bán, tổng doanh thu
    """
    return StatisticsService.get_staff_sales(db)

@router.get("/staffs/{staff_id}/sales", response_model=StaffSalesStats)
def get_staff_sales_by_id(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    THỐNG KÊ DOANH SỐ 1 NHÂN VIÊN
    """
    return StatisticsService.get_staff_sales_by_id(db, staff_id)

@router.get("/staffs/{staff_id}/sales/by-month", response_model=List[StaffSalesByPeriod])
def get_staff_sales_by_month(
    staff_id: int,
    year: Optional[int] = Query(None, description="Năm cần lọc, mặc định là năm hiện tại"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DOANH SỐ NHÂN VIÊN THEO THÁNG
    """
    return StatisticsService.get_staff_sales_by_month(db, staff_id, year)

@router.get("/staffs/{staff_id}/sales/by-day", response_model=List[StaffSalesByPeriod])
def get_staff_sales_by_day(
    staff_id: int,
    start_date: date = Query(..., description="Ngày bắt đầu"),
    end_date: date = Query(..., description="Ngày kết thúc"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DOANH SỐ NHÂN VIÊN THEO NGÀY
    """
    return StatisticsService.get_staff_sales_by_day(db, staff_id, start_date, end_date)

#   STORE STATISTICS  

@router.get("/store/overview", response_model=StoreOverview)
def get_store_overview(
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    TỔNG QUAN CỬA HÀNG
    
    Bao gồm: tổng doanh thu, tổng đơn hàng, tổng xe bán, tổng khách hàng
    """
    return StatisticsService.get_store_overview(db)

@router.get("/store/sales/by-day", response_model=List[StoreSalesByPeriod])
def get_store_sales_by_day(
    start_date: date = Query(..., description="Ngày bắt đầu"),
    end_date: date = Query(..., description="Ngày kết thúc"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DOANH SỐ CỬA HÀNG THEO NGÀY
    """
    return StatisticsService.get_store_sales_by_day(db, start_date, end_date)

@router.get("/store/sales/by-month", response_model=List[StoreSalesByPeriod])
def get_store_sales_by_month(
    year: Optional[int] = Query(None, description="Năm cần lọc"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DOANH SỐ CỬA HÀNG THEO THÁNG
    """
    return StatisticsService.get_store_sales_by_month(db, year)

@router.get("/store/sales/by-quarter", response_model=List[StoreSalesByPeriod])
def get_store_sales_by_quarter(
    year: Optional[int] = Query(None, description="Năm cần lọc"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DOANH SỐ CỬA HÀNG THEO QUÝ
    """
    return StatisticsService.get_store_sales_by_quarter(db, year)

@router.get("/store/sales/by-year", response_model=List[StoreSalesByPeriod])
def get_store_sales_by_year(
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DOANH SỐ CỬA HÀNG THEO NĂM
    """
    return StatisticsService.get_store_sales_by_year(db)

#   PRODUCT STATISTICS  

@router.get("/products/top-selling", response_model=TopProductsResponse)
def get_top_selling_products(
    limit: int = Query(10, ge=1, le=100, description="Số lượng sản phẩm trả về"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    TOP SẢN PHẨM BÁN CHẠY NHẤT
    
    Sắp xếp theo số lượng bán
    """
    return StatisticsService.get_top_selling_products(db, limit)

#   CUSTOMER STATISTICS  

@router.get("/customers/top-buyers", response_model=TopCustomersResponse)
def get_top_customers(
    limit: int = Query(10, ge=1, le=100, description="Số lượng khách hàng trả về"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    TOP KHÁCH HÀNG MUA NHIỀU NHẤT
    
    Sắp xếp theo tổng số tiền đã chi
    """
    return StatisticsService.get_top_customers(db, limit)

@router.get("/customers/highest-orders", response_model=HighestOrdersResponse)
def get_highest_orders(
    limit: int = Query(10, ge=1, le=100, description="Số lượng đơn hàng trả về"),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    DANH SÁCH ĐƠN HÀNG CÓ GIÁ TRỊ CAO NHẤT
    
    Sắp xếp theo giá trị đơn hàng
    """
    return StatisticsService.get_highest_orders(db, limit)
