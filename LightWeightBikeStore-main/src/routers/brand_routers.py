from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.brand import Brand
from schemas.brand import BrandCreate, BrandUpdate, BrandResponse
from middleware.auth import get_current_user, require_admin
from models.staff import Staff
from services.brand_service import BrandService

router = APIRouter(prefix="/api/brands", tags=["Brands"])

@router.get("", response_model=List[BrandResponse])
def get_brands(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Lấy danh sách brands"""
    return BrandService.get_brands(db, skip, limit)

@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết brand theo ID"""
    return BrandService.get_brand_by_id(db, brand_id)

@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    request: BrandCreate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Tạo brand mới (Admin only)"""
    return BrandService.create_brand(db, request)

@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: int,
    request: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Cập nhật brand (Admin only)"""
    return BrandService.update_brand(db, brand_id, request)

@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Xóa brand (Admin only)"""
    BrandService.delete_brand(db, brand_id)
    return None
