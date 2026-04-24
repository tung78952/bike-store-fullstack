from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    """Schema đăng ký tài khoản ADMIN"""
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class StaffProfileUpdate(BaseModel):
    """Schema cập nhật profile của staff"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None  
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class LoginRequest(BaseModel):
    """Schema đăng nhập"""
    username: str
    password: str

class TokenResponse(BaseModel):
    """Schema JWT token response"""
    access_token: str
    token_type: str

class StaffResponse(BaseModel):
    """Schema thông tin staff"""
    staff_id: int
    username: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
