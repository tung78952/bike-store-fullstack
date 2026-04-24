import sys
import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from src.main import app
from core.database import get_db, Base
import src.middleware.auth as auth_mw
from core.security import hash_password

from models import staff, brand, category, customer, product, order, order_item


# SQLite in-memory database cho testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    """Tạo SQLite in-memory database cho mỗi test"""
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_admin(test_db):
    """Tạo admin user trong test database"""
    from models.staff import Staff
    
    admin = Staff(
        staff_id=1,
        first_name="Test",
        last_name="Admin",
        email="admin@test.com",
        username="test_admin",
        hashed_password=hash_password("password123"),
        role="ADMIN",
        is_active=True,
        active=True,
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def override_dependencies(test_db, test_admin):
    """Override FastAPI dependencies để dùng test database"""
    app.dependency_overrides.clear()
    
    def get_test_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = get_test_db
    
    yield
    
    app.dependency_overrides.clear()


@pytest.fixture
def auth_token(override_dependencies, test_admin):
    """Lấy auth token thực sự bằng cách login"""
    with TestClient(app) as temp_client:
        # Login qua /token endpoint - OAuth2 standard endpoint
        response = temp_client.post(
            "/api/auth/token",
            data={
                "username": test_admin.username,
                "password": "password123"
            }
        )
        if response.status_code != 200:
            print(f"Login failed: {response.status_code}, {response.text}")
        assert response.status_code == 200, f"Login failed: {response.json()}"
        return response.json()["access_token"]


@pytest.fixture
def client(auth_token):
    """Test client với auth token trong header"""
    with TestClient(app) as test_client:
        test_client.headers.update({"Authorization": f"Bearer {auth_token}"})
        yield test_client
