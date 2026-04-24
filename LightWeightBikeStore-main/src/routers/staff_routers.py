from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.staff import Staff
from schemas.staff import StaffUpdate, StaffListResponse, StaffCreate
from middleware.auth import get_current_user, require_admin
from services.staff_service import StaffService

router = APIRouter(prefix="/api/staffs", tags=["Staffs"])

@router.post("", response_model=StaffListResponse, status_code=status.HTTP_201_CREATED)
def create_staff(
    request: StaffCreate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    TẠO TÀI KHOẢN STAFF MỚI (CHỈ ADMIN)
    
    Admin tạo staff mới, staff đó sẽ được quản lý bởi admin tạo ra họ.
    - username: Tên đăng nhập (duy nhất)
    - email: Email (duy nhất, bắt buộc)
    - password: Mật khẩu (>= 8 ký tự)
    """
    return StaffService.create_staff(db, request, current_user)

@router.get("", response_model=List[StaffListResponse])
def get_staffs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Lấy danh sách staffs do admin hiện tại quản lý (Admin only)"""
    return StaffService.get_staffs(db, current_user, skip, limit)

@router.get("/{staff_id}", response_model=StaffListResponse)
def get_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """Lấy chi tiết staff do admin hiện tại quản lý (Admin only)"""
    return StaffService.get_staff_by_id(db, staff_id, current_user)

@router.put("/{staff_id}", response_model=StaffListResponse)
def update_staff(
    staff_id: int,
    request: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    Cập nhật thông tin staff (Chỉ admin quản lý staff đó)
    Admin có quyền:
    - Cập nhật email của staff
    - Cập nhật tất cả thông tin khác (first_name, last_name, phone, active, is_active)
    
    """
    return StaffService.update_staff(db, staff_id, request, current_user)

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(require_admin)
):
    """
    Xóa tài khoản staff (Chỉ admin quản lý staff đó)
    Admin có thể xóa staff mà chính họ tạo ra (manager_id = admin_id)
    Không thể xóa chính mình
    """
    StaffService.delete_staff(db, staff_id, current_user)
    return None
