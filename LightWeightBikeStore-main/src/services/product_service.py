from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.product import Product
from models.brand import Brand
from models.category import Category
from schemas.product import ProductCreate, ProductUpdate
from typing import List, Optional

class ProductService:
    @staticmethod
    def get_products(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        brand_id: Optional[int] = None, 
        category_id: Optional[int] = None
    ) -> List[Product]:
        """Danh sách sản phẩm với filter brand/category và phân trang"""
        query = db.query(Product)
        
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    @staticmethod
    def create_product(db: Session, request: ProductCreate) -> Product:
        """Tạo sản phẩm: kiểm tra brand/category, rồi lưu"""
        # Kiểm tra brand tồn tại
        brand = db.query(Brand).filter(Brand.brand_id == request.brand_id).first()
        if not brand:
            raise HTTPException(status_code=400, detail="Brand not found")
        
        # Kiểm tra category tồn tại
        category = db.query(Category).filter(Category.category_id == request.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        
        product = Product(**request.model_dump())  # Tạo object Product từ schema
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product(db: Session, product_id: int, request: ProductUpdate) -> Product:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        update_data = request.model_dump(exclude_unset=True)  # Chỉ cập nhật trường được gửi
        for key, value in update_data.items():
            setattr(product, key, value)
        
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> None:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        db.delete(product)
        db.commit()
