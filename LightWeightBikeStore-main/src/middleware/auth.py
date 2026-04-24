from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core.database import get_db
from models.staff import Staff
from core.security import decode_access_token

# Định nghĩa OAuth2 Bearer: yêu cầu client gửi header Authorization: Bearer <token>
# tokenUrl: endpoint dùng để lấy token (đăng nhập)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Staff:
    """Middleware: Giải mã JWT để lấy user hiện tại từ DB"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Giải mã token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception  # Token hỏng/hết hạn

    # Lấy username từ payload 
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception

    # Truy vấn DB để lấy user tương ứng
    user = db.query(Staff).filter(Staff.username == username).first()
    if user is None:
        raise credentials_exception

    # Kiểm tra trạng thái hoạt động
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return user

def require_admin(current_user: Staff = Depends(get_current_user)) -> Staff:
    """Middleware: Chặn truy cập nếu không có quyền ADMIN"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
