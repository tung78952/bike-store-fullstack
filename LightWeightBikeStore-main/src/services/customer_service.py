from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerUpdate
from typing import List, Optional

class CustomerService:
    @staticmethod
    def get_customers(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        city: Optional[str] = None, 
        state: Optional[str] = None
    ) -> List[Customer]:
        query = db.query(Customer)
        
        if city:
            query = query.filter(Customer.city == city)
        if state:
            query = query.filter(Customer.state == state)
        
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    @staticmethod
    def create_customer(db: Session, request: CustomerCreate) -> Customer:
        # Kiểm tra email đã tồn tại
        existing = db.query(Customer).filter(Customer.email == request.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        customer = Customer(**request.model_dump())
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update_customer(db: Session, customer_id: int, request: CustomerUpdate) -> Customer:
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(customer, key, value)
        
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> None:
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        db.delete(customer)
        db.commit()
