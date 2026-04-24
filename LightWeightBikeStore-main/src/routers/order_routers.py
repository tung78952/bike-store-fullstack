from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.order import Order
from models.order_item import OrderItem
from models.customer import Customer
from models.staff import Staff
from models.product import Product
from schemas.order import (
    OrderCreate, OrderUpdate, OrderResponse, OrderWithItemsResponse,
    OrderItemCreate, OrderItemUpdate, OrderItemResponse
)
from middleware.auth import get_current_user, require_admin
from services.order_service import OrderService

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=List[OrderResponse])
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    customer_id: Optional[int] = None,
    staff_id: Optional[int] = None,
    order_status: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Lấy danh sách orders"""
    return OrderService.get_orders(db, skip, limit, customer_id, staff_id, order_status)

@router.get("/{order_id}", response_model=OrderWithItemsResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Lấy chi tiết order theo ID"""
    return OrderService.get_order_by_id(db, order_id)

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    request: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Tạo order mới"""
    return OrderService.create_order(db, request)

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    request: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Cập nhật order"""
    return OrderService.update_order(db, order_id, request)

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Xóa order (Admin only)"""
    OrderService.delete_order(db, order_id)
    return None


@router.get("/{order_id}/items", response_model=List[OrderItemResponse])
def get_order_items(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Lấy danh sách items của order"""
    return OrderService.get_order_items(db, order_id)

@router.post("/{order_id}/items", response_model=OrderItemResponse, status_code=status.HTTP_201_CREATED)
def add_order_item(
    order_id: int,
    request: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Thêm item vào order"""
    return OrderService.add_order_item(db, order_id, request)

@router.put("/{order_id}/items/{item_id}", response_model=OrderItemResponse)
def update_order_item(
    order_id: int,
    item_id: int,
    request: OrderItemUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Cập nhật item trong order"""
    return OrderService.update_order_item(db, order_id, item_id, request)

@router.delete("/{order_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_item(
    order_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Xóa item khỏi order"""
    OrderService.delete_order_item(db, order_id, item_id)
    return None
