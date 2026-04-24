from pydantic import BaseModel
from typing import Optional

#    REQUEST SCHEMAS   

class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: str
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

#    RESPONSE SCHEMAS   

class CustomerResponse(BaseModel):
    customer_id: int
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: str
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

    class Config:
        from_attributes = True
