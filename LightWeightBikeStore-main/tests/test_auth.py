def test_register_and_login(client, test_db):
    # Test register
    resp = client.post("/api/auth/register", json={
        "username":"newadmin",
        "email":"new@test.com",
        "password":"password123",
        "first_name":"New",
        "last_name":"Admin"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "newadmin"
    assert data["email"] == "new@test.com"

    # Test login
    resp = client.post("/api/auth/login", json={
        "username":"newadmin",
        "password":"password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_token_endpoint(client, test_admin):
    """Test /token endpoint (OAuth2 standard)"""
    resp = client.post("/api/auth/token", data={
        "username": test_admin.username,
        "password": "password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_get_me(client, test_admin):
    """Test GET /me endpoint"""
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == test_admin.username


def test_update_profile(client):
    """Test PUT /profile endpoint"""
    update_data = {
        "first_name": "Updated",
        "last_name": "Profile"
    }
    resp = client.put("/api/auth/profile", json=update_data)
    assert resp.status_code == 200
    data = resp.json()
    assert data["first_name"] == "Updated"
