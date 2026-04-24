from pydantic import BaseModel
from typing import Optional

#    REQUEST SCHEMAS   

class CategoryCreate(BaseModel):
    category_name: str

class CategoryUpdate(BaseModel):
    category_name: Optional[str] = None

#    RESPONSE SCHEMAS   

class CategoryResponse(BaseModel):
    category_id: int
    category_name: str

    class Config:
        from_attributes = True
