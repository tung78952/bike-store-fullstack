from pydantic import BaseModel
from typing import Optional

#    REQUEST SCHEMAS   

class BrandCreate(BaseModel):
    brand_name: str

class BrandUpdate(BaseModel):
    brand_name: Optional[str] = None

#    RESPONSE SCHEMAS   

class BrandResponse(BaseModel):
    brand_id: int
    brand_name: str

    class Config:
        from_attributes = True
