from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
# Import các nhóm router chức năng của API
from routers import (
    auth_routers,
    product_routers,
    brand_routers,
    category_routers,
    customer_routers,
    order_routers,
    staff_routers,
    statistics_routers
)

# Khởi tạo ứng dụng FastAPI với mô tả rõ ràng
app = FastAPI(
    title="LightWeight Bike Store API",
    description="Backend API with JWT Authentication & Authorization",
    version="2.0.0",
    docs_url="/docs",   # Trang Swagger UI
    redoc_url="/redoc"  # Trang ReDoc
)

# CORS: Cho phép frontend từ domain khác gọi API
# Lấy danh sách origins từ biến môi trường hoặc cho phép tất cả
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default router: các endpoint cơ bản (root, health)
default_route = APIRouter(tags=['DEFAULT'])

@default_route.get("/", response_class=JSONResponse)
def read_root():
    return {
        "message": "LightWeight Bike Store API v2.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "products": "/api/products",
            "brands": "/api/brands",
            "categories": "/api/categories",
            "customers": "/api/customers",
            "orders": "/api/orders",
            "staffs": "/api/staffs",
            "statistics": "/api/statistics"
        }
    }

@default_route.get("/health", response_class=JSONResponse)
def health_check():
    return {"status": "healthy", "version": "2.0.0"}

# Include routers: đăng ký các nhóm endpoint vào app
app.include_router(default_route)
app.include_router(auth_routers.router)
app.include_router(product_routers.router)
app.include_router(brand_routers.router)
app.include_router(category_routers.router)
app.include_router(customer_routers.router)
app.include_router(order_routers.router)
app.include_router(staff_routers.router)
app.include_router(statistics_routers.router)

if __name__ == "__main__":
    # Chạy server phát triển: http://localhost:8000
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
