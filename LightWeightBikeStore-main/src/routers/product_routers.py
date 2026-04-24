from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.product import Product
from models.brand import Brand
from models.category import Category
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from middleware.auth import get_current_user, require_admin
from models.staff import Staff
from services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    brand_id: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Lấy danh sách sản phẩm"""
    return ProductService.get_products(db, skip, limit, brand_id, category_id)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết 1 sản phẩm theo ID"""
    return ProductService.get_product_by_id(db, product_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    request: ProductCreate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Tạo sản phẩm mới (chỉ ADMIN)"""
    return ProductService.create_product(db, request)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    request: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Cập nhật sản phẩm (chỉ ADMIN)"""
    return ProductService.update_product(db, product_id, request)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Xóa sản phẩm (chỉ ADMIN)"""
    ProductService.delete_product(db, product_id)
    return None
