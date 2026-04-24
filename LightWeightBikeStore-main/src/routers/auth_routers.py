from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, StaffResponse, StaffProfileUpdate
from services.auth_service import AuthService
from middleware.auth import get_current_user, require_admin
from models.staff import Staff

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest, 
    db: Session = Depends(get_db)
):
    """
    ĐĂNG KÝ TÀI KHOẢN ADMIN MỚI
    """
    return AuthService.register_admin(db, request)

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    ĐĂNG NHẬP: Trả về JWT access token
    """
    return AuthService.login(db, request)

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Lấy token theo chuẩn OAuth2 
    """
    request = LoginRequest(username=form_data.username, password=form_data.password)
    return AuthService.login(db, request)

@router.get("/me", response_model=StaffResponse)
def get_current_user_info(current_user: Staff = Depends(get_current_user)):
    """
    Lấy thông tin user hiện tại 
    """
    return current_user

@router.put("/profile", response_model=StaffResponse)
def update_own_profile(
    request: StaffProfileUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """
    CẬP NHẬT THÔNG TIN CÁ NHÂN (CẢ ADMIN VÀ STAFF)
    Staff có thể tự cập nhật thông tin của mình NGOẠI TRỪ email
    - first_name, last_name, phone, password có thể thay đổi
    - Email CHỈ admin mới có quyền thay đổi 
    """
    return AuthService.update_own_profile(db, current_user.staff_id, request)
