from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models.staff import Staff
from schemas.staff import StaffUpdate, StaffCreate
from core.security import hash_password
from typing import List

class StaffService:
    @staticmethod
    def create_staff(db: Session, request: StaffCreate, current_user: Staff) -> Staff:
        """Tạo staff mới (chỉ admin), staff sẽ có manager_id = admin tạo ra họ"""
        # Kiểm tra username hoặc email đã tồn tại
        existing_user = db.query(Staff).filter(
            (Staff.username == request.username) | (Staff.email == request.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Hash password
        hashed_pwd = hash_password(request.password)
        
        # Tạo staff mới với manager_id = admin hiện tại
        new_staff = Staff(
            username=request.username,
            email=request.email,
            hashed_password=hashed_pwd,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            role="STAFF",
            manager_id=current_user.staff_id,
            is_active=True
        )
        
        try:
            db.add(new_staff)
            db.commit()
            db.refresh(new_staff)
            return new_staff
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database integrity error: {str(e.orig)}"
            )
    @staticmethod
    def get_staffs(db: Session, current_user: Staff, skip: int = 0, limit: int = 100) -> List[Staff]:
        """
        Lấy danh sách staff của admin hiện tại
        Chỉ trả về các staff có manager_id = admin_id
        """
        return db.query(Staff).filter(
            Staff.manager_id == current_user.staff_id
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_staff_by_id(db: Session, staff_id: int, current_user: Staff) -> Staff:
        """
        Lấy thông tin staff theo ID
        Kiểm tra staff phải do admin hiện tại quản lý
        """
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        # Kiểm tra quyền quản lý: staff phải có manager_id = admin_id
        if staff.manager_id != current_user.staff_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only manage your own staff members"
            )
        
        return staff

    @staticmethod
    def update_staff(db: Session, staff_id: int, request: StaffUpdate, current_user: Staff) -> Staff:
        """
        Cập nhật thông tin staff
        Chỉ admin quản lý staff đó mới có quyền sửa
        """
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        # Kiểm tra quyền quản lý
        if staff.manager_id != current_user.staff_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only manage your own staff members"
            )
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(staff, key, value)
        
        db.commit()
        db.refresh(staff)
        return staff

    @staticmethod
    def delete_staff(db: Session, staff_id: int, current_user: Staff) -> None:
        """
        Xóa staff
        Chỉ admin quản lý staff đó mới có quyền xóa
        """
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        # Không cho phép xóa chính mình
        if staff.staff_id == current_user.staff_id:
            raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
        # Kiểm tra quyền quản lý
        if staff.manager_id != current_user.staff_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own staff members"
            )
        
        db.delete(staff)
        db.commit()
