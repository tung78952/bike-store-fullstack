from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.brand import Brand
from schemas.brand import BrandCreate, BrandUpdate
from typing import List

class BrandService:
    @staticmethod
    def get_brands(db: Session, skip: int = 0, limit: int = 100) -> List[Brand]:
        return db.query(Brand).offset(skip).limit(limit).all()

    @staticmethod
    def get_brand_by_id(db: Session, brand_id: int) -> Brand:
        brand = db.query(Brand).filter(Brand.brand_id == brand_id).first()
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        return brand

    @staticmethod
    def create_brand(db: Session, request: BrandCreate) -> Brand:
        brand = Brand(**request.model_dump())
        db.add(brand)
        db.commit()
        db.refresh(brand)
        return brand

    @staticmethod
    def update_brand(db: Session, brand_id: int, request: BrandUpdate) -> Brand:
        brand = db.query(Brand).filter(Brand.brand_id == brand_id).first()
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(brand, key, value)
        
        db.commit()
        db.refresh(brand)
        return brand

    @staticmethod
    def delete_brand(db: Session, brand_id: int) -> None:
        brand = db.query(Brand).filter(Brand.brand_id == brand_id).first()
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        
        db.delete(brand)
        db.commit()
