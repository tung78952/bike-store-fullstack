from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from fastapi import HTTPException
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from models.staff import Staff
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.brand import Brand
from models.category import Category
from models.customer import Customer
from schemas.statistics import (
    StaffCountResponse,
    StaffSalesStats,
    StaffSalesByPeriod,
    StoreSalesByPeriod,
    StoreOverview,
    TopSellingProduct,
    TopProductsResponse,
    TopCustomer,
    TopCustomersResponse,
    CustomerHighestOrder,
    HighestOrdersResponse
)

class StatisticsService:
    @staticmethod
    def get_staff_count(db: Session) -> StaffCountResponse:
        total = db.query(func.count(Staff.staff_id)).scalar()
        active = db.query(func.count(Staff.staff_id)).filter(Staff.active == True).scalar()
        inactive = total - active
        
        return StaffCountResponse(
            total_staffs=total,
            active_staffs=active,
            inactive_staffs=inactive
        )

    @staticmethod
    def get_staff_sales(db: Session) -> List[StaffSalesStats]:
        results = db.query(
            Staff.staff_id,
            func.concat(Staff.first_name, ' ', Staff.last_name).label('staff_name'),
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).outerjoin(
            Order, Staff.staff_id == Order.staff_id
        ).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).group_by(
            Staff.staff_id, Staff.first_name, Staff.last_name
        ).order_by(
            desc('total_revenue')
        ).all()
        
        return [
            StaffSalesStats(
                staff_id=r.staff_id,
                staff_name=r.staff_name or f"Staff {r.staff_id}",
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0))
            )
            for r in results
        ]

    @staticmethod
    def get_staff_sales_by_id(db: Session, staff_id: int) -> StaffSalesStats:
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        result = db.query(
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).filter(
            Order.staff_id == staff_id
        ).first()
        
        return StaffSalesStats(
            staff_id=staff_id,
            staff_name=f"{staff.first_name} {staff.last_name}",
            total_orders=result.total_orders or 0,
            total_bikes_sold=int(result.total_bikes_sold or 0),
            total_revenue=Decimal(str(result.total_revenue or 0))
        )

    @staticmethod
    def get_staff_sales_by_month(db: Session, staff_id: int, year: Optional[int] = None) -> List[StaffSalesByPeriod]:
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        if year is None:
            year = datetime.now().year
        
        results = db.query(
            extract('month', Order.order_date).label('month'),
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).filter(
            Order.staff_id == staff_id,
            extract('year', Order.order_date) == year
        ).group_by(
            extract('month', Order.order_date)
        ).order_by('month').all()
        
        return [
            StaffSalesByPeriod(
                staff_id=staff_id,
                staff_name=f"{staff.first_name} {staff.last_name}",
                period=f"{year}-{int(r.month):02d}",
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0))
            )
            for r in results
        ]

    @staticmethod
    def get_staff_sales_by_day(db: Session, staff_id: int, start_date: date, end_date: date) -> List[StaffSalesByPeriod]:
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        results = db.query(
            Order.order_date,
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).filter(
            Order.staff_id == staff_id,
            Order.order_date >= start_date,
            Order.order_date <= end_date
        ).group_by(
            Order.order_date
        ).order_by(Order.order_date).all()
        
        return [
            StaffSalesByPeriod(
                staff_id=staff_id,
                staff_name=f"{staff.first_name} {staff.last_name}",
                period=str(r.order_date),
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0))
            )
            for r in results
        ]

    @staticmethod
    def get_store_overview(db: Session) -> StoreOverview:
        sales_result = db.query(
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).first()
        
        total_customers = db.query(func.count(Customer.customer_id)).scalar()
        total_products = db.query(func.count(Product.product_id)).scalar()
        
        total_orders = sales_result.total_orders or 0
        total_revenue = Decimal(str(sales_result.total_revenue or 0))
        avg_order_value = total_revenue / total_orders if total_orders > 0 else Decimal('0')
        
        return StoreOverview(
            total_revenue=total_revenue,
            total_orders=total_orders,
            total_bikes_sold=int(sales_result.total_bikes_sold or 0),
            total_customers=total_customers,
            total_products=total_products,
            avg_order_value=round(avg_order_value, 2)
        )

    @staticmethod
    def get_store_sales_by_day(db: Session, start_date: date, end_date: date) -> List[StoreSalesByPeriod]:
        results = db.query(
            Order.order_date,
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).filter(
            Order.order_date >= start_date,
            Order.order_date <= end_date
        ).group_by(
            Order.order_date
        ).order_by(Order.order_date).all()
        
        return [
            StoreSalesByPeriod(
                period=str(r.order_date),
                period_type="day",
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0)),
                avg_order_value=round(
                    Decimal(str(r.total_revenue or 0)) / r.total_orders if r.total_orders else Decimal('0'), 
                    2
                )
            )
            for r in results
        ]

    @staticmethod
    def get_store_sales_by_month(db: Session, year: Optional[int] = None) -> List[StoreSalesByPeriod]:
        query = db.query(
            extract('year', Order.order_date).label('year'),
            extract('month', Order.order_date).label('month'),
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        )
        
        if year:
            query = query.filter(extract('year', Order.order_date) == year)
        
        results = query.group_by(
            extract('year', Order.order_date),
            extract('month', Order.order_date)
        ).order_by('year', 'month').all()
        
        return [
            StoreSalesByPeriod(
                period=f"{int(r.year)}-{int(r.month):02d}",
                period_type="month",
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0)),
                avg_order_value=round(
                    Decimal(str(r.total_revenue or 0)) / r.total_orders if r.total_orders else Decimal('0'), 
                    2
                )
            )
            for r in results
        ]

    @staticmethod
    def get_store_sales_by_quarter(db: Session, year: Optional[int] = None) -> List[StoreSalesByPeriod]:
        query = db.query(
            extract('year', Order.order_date).label('year'),
            extract('quarter', Order.order_date).label('quarter'),
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        )
        
        if year:
            query = query.filter(extract('year', Order.order_date) == year)
        
        results = query.group_by(
            extract('year', Order.order_date),
            extract('quarter', Order.order_date)
        ).order_by('year', 'quarter').all()
        
        return [
            StoreSalesByPeriod(
                period=f"{int(r.year)}-Q{int(r.quarter)}",
                period_type="quarter",
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0)),
                avg_order_value=round(
                    Decimal(str(r.total_revenue or 0)) / r.total_orders if r.total_orders else Decimal('0'), 
                    2
                )
            )
            for r in results
        ]

    @staticmethod
    def get_store_sales_by_year(db: Session) -> List[StoreSalesByPeriod]:
        results = db.query(
            extract('year', Order.order_date).label('year'),
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Order).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).group_by(
            extract('year', Order.order_date)
        ).order_by('year').all()
        
        return [
            StoreSalesByPeriod(
                period=str(int(r.year)),
                period_type="year",
                total_orders=r.total_orders or 0,
                total_bikes_sold=int(r.total_bikes_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0)),
                avg_order_value=round(
                    Decimal(str(r.total_revenue or 0)) / r.total_orders if r.total_orders else Decimal('0'), 
                    2
                )
            )
            for r in results
        ]

    @staticmethod
    def get_top_selling_products(db: Session, limit: int = 10) -> TopProductsResponse:
        results = db.query(
            Product.product_id,
            Product.product_name,
            Brand.brand_name,
            Category.category_name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_quantity_sold'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_revenue')
        ).select_from(Product).outerjoin(
            Brand, Product.brand_id == Brand.brand_id
        ).outerjoin(
            Category, Product.category_id == Category.category_id
        ).outerjoin(
            OrderItem, Product.product_id == OrderItem.product_id
        ).group_by(
            Product.product_id, Product.product_name, Brand.brand_name, Category.category_name
        ).order_by(
            desc('total_quantity_sold')
        ).limit(limit).all()
        
        products = [
            TopSellingProduct(
                product_id=r.product_id,
                product_name=r.product_name,
                brand_name=r.brand_name,
                category_name=r.category_name,
                total_quantity_sold=int(r.total_quantity_sold or 0),
                total_revenue=Decimal(str(r.total_revenue or 0))
            )
            for r in results
        ]
        
        return TopProductsResponse(products=products, total_count=len(products))

    @staticmethod
    def get_top_customers(db: Session, limit: int = 10) -> TopCustomersResponse:
        results = db.query(
            Customer.customer_id,
            func.concat(Customer.first_name, ' ', Customer.last_name).label('customer_name'),
            Customer.email,
            Customer.phone,
            func.count(func.distinct(Order.order_id)).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_bikes_bought'),
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('total_spent')
        ).select_from(Customer).outerjoin(
            Order, Customer.customer_id == Order.customer_id
        ).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).group_by(
            Customer.customer_id, Customer.first_name, Customer.last_name, Customer.email, Customer.phone
        ).order_by(
            desc('total_spent')
        ).limit(limit).all()
        
        customers = [
            TopCustomer(
                customer_id=r.customer_id,
                customer_name=r.customer_name or f"Customer {r.customer_id}",
                email=r.email,
                phone=r.phone,
                total_orders=r.total_orders or 0,
                total_bikes_bought=int(r.total_bikes_bought or 0),
                total_spent=Decimal(str(r.total_spent or 0))
            )
            for r in results
        ]
        
        return TopCustomersResponse(customers=customers, total_count=len(customers))

    @staticmethod
    def get_highest_orders(db: Session, limit: int = 10) -> HighestOrdersResponse:
        order_values = db.query(
            Order.order_id,
            Order.customer_id,
            Order.order_date,
            func.coalesce(
                func.sum(OrderItem.quantity * OrderItem.list_price * (1 - OrderItem.discount)), 
                0
            ).label('order_value'),
            func.count(OrderItem.item_id).label('items_count')
        ).outerjoin(
            OrderItem, Order.order_id == OrderItem.order_id
        ).group_by(
            Order.order_id, Order.customer_id, Order.order_date
        ).subquery()
        
        results = db.query(
            order_values.c.order_id,
            order_values.c.customer_id,
            order_values.c.order_date,
            order_values.c.order_value,
            order_values.c.items_count,
            func.concat(Customer.first_name, ' ', Customer.last_name).label('customer_name'),
            Customer.email
        ).join(
            Customer, order_values.c.customer_id == Customer.customer_id
        ).order_by(
            desc(order_values.c.order_value)
        ).limit(limit).all()
        
        orders = [
            CustomerHighestOrder(
                customer_id=r.customer_id,
                customer_name=r.customer_name or f"Customer {r.customer_id}",
                email=r.email,
                order_id=r.order_id,
                order_date=r.order_date,
                order_value=Decimal(str(r.order_value or 0)),
                items_count=r.items_count or 0
            )
            for r in results
        ]
        
        return HighestOrdersResponse(orders=orders, total_count=len(orders))
