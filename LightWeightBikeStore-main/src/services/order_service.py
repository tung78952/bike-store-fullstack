from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.order import Order
from models.order_item import OrderItem
from models.customer import Customer
from models.staff import Staff
from models.product import Product
from schemas.order import OrderCreate, OrderUpdate, OrderItemCreate, OrderItemUpdate, OrderWithItemsResponse
from typing import List, Optional

class OrderService:
    @staticmethod
    def get_orders(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        customer_id: Optional[int] = None, 
        staff_id: Optional[int] = None, 
        order_status: Optional[int] = None
    ) -> List[Order]:
        query = db.query(Order)
        
        if customer_id:
            query = query.filter(Order.customer_id == customer_id)
        if staff_id:
            query = query.filter(Order.staff_id == staff_id)
        if order_status:
            query = query.filter(Order.order_status == order_status)
        
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> OrderWithItemsResponse:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        
        return OrderWithItemsResponse(
            order_id=order.order_id,
            customer_id=order.customer_id,
            order_status=order.order_status,
            order_date=order.order_date,
            required_date=order.required_date,
            shipped_date=order.shipped_date,
            staff_id=order.staff_id,
            items=items
        )

    @staticmethod
    def create_order(db: Session, request: OrderCreate) -> Order:
        # Kiểm tra customer tồn tại (nếu có)
        if request.customer_id:
            customer = db.query(Customer).filter(Customer.customer_id == request.customer_id).first()
            if not customer:
                raise HTTPException(status_code=400, detail="Customer not found")
        
        # Kiểm tra staff tồn tại
        staff = db.query(Staff).filter(Staff.staff_id == request.staff_id).first()
        if not staff:
            raise HTTPException(status_code=400, detail="Staff not found")
        
        # Tạo order
        order_data = request.model_dump(exclude={"items"})
        order = Order(**order_data)
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Tạo order items (nếu có)
        if request.items:
            for idx, item_data in enumerate(request.items, start=1):
                # Kiểm tra product tồn tại
                product = db.query(Product).filter(Product.product_id == item_data.product_id).first()
                if not product:
                    raise HTTPException(status_code=400, detail=f"Product {item_data.product_id} not found")
                
                order_item = OrderItem(
                    order_id=order.order_id,
                    item_id=idx,
                    **item_data.model_dump()
                )
                db.add(order_item)
            db.commit()
        
        return order

    @staticmethod
    def update_order(db: Session, order_id: int, request: OrderUpdate) -> Order:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(order, key, value)
        
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def delete_order(db: Session, order_id: int) -> None:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Xóa order items trước
        db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()
        db.delete(order)
        db.commit()

    @staticmethod
    def get_order_items(db: Session, order_id: int) -> List[OrderItem]:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    @staticmethod
    def add_order_item(db: Session, order_id: int, request: OrderItemCreate) -> OrderItem:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Kiểm tra product tồn tại
        product = db.query(Product).filter(Product.product_id == request.product_id).first()
        if not product:
            raise HTTPException(status_code=400, detail="Product not found")
        
        # Lấy item_id tiếp theo
        max_item = db.query(OrderItem).filter(OrderItem.order_id == order_id).order_by(OrderItem.item_id.desc()).first()
        next_item_id = (max_item.item_id + 1) if max_item else 1
        
        order_item = OrderItem(
            order_id=order_id,
            item_id=next_item_id,
            **request.model_dump()
        )
        db.add(order_item)
        db.commit()
        db.refresh(order_item)
        return order_item

    @staticmethod
    def update_order_item(db: Session, order_id: int, item_id: int, request: OrderItemUpdate) -> OrderItem:
        order_item = db.query(OrderItem).filter(
            OrderItem.order_id == order_id,
            OrderItem.item_id == item_id
        ).first()
        if not order_item:
            raise HTTPException(status_code=404, detail="Order item not found")
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(order_item, key, value)
        
        db.commit()
        db.refresh(order_item)
        return order_item

    @staticmethod
    def delete_order_item(db: Session, order_id: int, item_id: int) -> None:
        order_item = db.query(OrderItem).filter(
            OrderItem.order_id == order_id,
            OrderItem.item_id == item_id
        ).first()
        if not order_item:
            raise HTTPException(status_code=404, detail="Order item not found")
        
        db.delete(order_item)
        db.commit()
