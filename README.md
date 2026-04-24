# Bike Store — Full-stack Management System

Hệ thống quản lý cửa hàng bán xe đạp gồm **REST API backend** và **SPA frontend**.

> **Nhóm thực hiện:** Trần Phan Thanh Tùng (23521747) · Trần Nguyễn Đức Trung (23521687)

## Cấu trúc repo

| Folder | Vai trò | Stack | README riêng |
|---|---|---|---|
| [`LightWeightBikeStore-main/`](LightWeightBikeStore-main/) | REST API (v2.0, 54 endpoints) | FastAPI · SQLAlchemy · Alembic · PostgreSQL · JWT | [link](LightWeightBikeStore-main/README.md) |
| [`FE-BikeStore-main/`](FE-BikeStore-main/) | SPA quản trị (`velos-enterprise`) | Vite · React 18 · React Router · Tailwind · Axios · Recharts | [link](FE-BikeStore-main/README.md) |

Mỗi folder là 1 ứng dụng độc lập, cài đặt & chạy riêng. Xem README bên trong mỗi folder để biết chi tiết.

## Tính năng chính

- Xác thực & phân quyền JWT (ADMIN / STAFF)
- Quản lý sản phẩm, thương hiệu, danh mục
- Quản lý khách hàng & đơn hàng (chi tiết order items)
- Quản lý nhân viên (admin-only)
- Thống kê kinh doanh đa chiều: theo ngày / tháng / quý / năm, top sản phẩm, top khách hàng

## Khởi động nhanh — chạy local

### 1. Backend

```bash
cd LightWeightBikeStore-main
python -m venv src/venv
# Windows:
src\venv\Scripts\Activate.ps1
# macOS/Linux:
source src/venv/bin/activate

pip install -r src/requirements.txt

# Tạo file src/.env (xem src/.env.example làm mẫu)
# — cần DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

cd src
uvicorn main:app --reload
```

Backend chạy tại `http://localhost:8000` · Swagger UI: `/docs` · Health: `/health`.

### 2. Frontend

```bash
cd FE-BikeStore-main
npm install

# (tuỳ chọn) tạo file .env với:
# VITE_API_BASE_URL=http://localhost:8000
# — nếu không tạo, FE tự fallback về http://localhost:8000

npm run dev
```

Frontend chạy tại `http://localhost:5173`.

## Luồng Auth end-to-end

1. FE gửi `POST /api/auth/login` với `{username, password}` (JSON).
2. BE trả `{access_token, token_type: "bearer", ...}`.
3. FE lưu token vào `localStorage.access_token` và đính kèm `Authorization: Bearer <token>` cho mọi request sau.
4. Khi token hết hạn hoặc sai → BE trả 401 → FE tự redirect về `/login`.

## Yêu cầu hệ thống

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+ (hoặc Supabase / database tương thích)

## License

MIT — mục đích học tập & nghiên cứu.
