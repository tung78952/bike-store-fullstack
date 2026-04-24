from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models.staff import Staff
from schemas.auth import RegisterRequest, LoginRequest, StaffProfileUpdate
from core.security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

class AuthService:
    @staticmethod
    def register_admin(db: Session, request: RegisterRequest) -> Staff:
        """Đăng ký tài khoản ADMIN (PUBLIC, không cần auth)"""
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
        
        # Tạo admin mới (luôn là ADMIN, manager_id = NULL)
        new_staff = Staff(
            username=request.username,
            email=request.email,
            hashed_password=hashed_pwd,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            role="ADMIN",
            manager_id=None
        )
        
        try:
            db.add(new_staff)
            db.commit()
            db.refresh(new_staff)
            return new_staff
        except IntegrityError as e:
            db.rollback()
            print(f"IntegrityError: {e}")  # Log để debug (ví dụ: vi phạm unique)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database integrity error: {str(e.orig)}"
            )
    
    @staticmethod
    def login(db: Session, request: LoginRequest) -> dict:
        """Đăng nhập: xác thực mật khẩu, kiểm tra active, trả JWT"""
        # Tìm user theo username
        user = db.query(Staff).filter(Staff.username == request.username).first()
        
        # Verify password
        if not user or not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        # Kiểm tra tài khoản active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
        # Tạo JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user.username,
                "staff_id": user.staff_id,
                "role": user.role
            },
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    def update_own_profile(db: Session, staff_id: int, request: StaffProfileUpdate) -> Staff:
        """Cập nhật profile của staff (KHÔNG bao gồm email, role)"""
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        # Cập nhật các trường được phép
        update_data = request.model_dump(exclude_unset=True)
        
        # Nếu có đổi password, phải hash lại
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = hash_password(update_data["password"])
            del update_data["password"]
        
        for key, value in update_data.items():
            setattr(staff, key, value)
        
        try:
            db.commit()
            db.refresh(staff)
            return staff
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database integrity error: {str(e.orig)}"
            )
