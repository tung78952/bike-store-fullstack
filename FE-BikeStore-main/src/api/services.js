import { api } from "./client";

export const authApi = {
  login: (payload) => api.post("/api/auth/login", payload),
  me: () => api.get("/api/auth/me"),
  updateProfile: (payload) => api.put("/api/auth/profile", payload),
};

export const brandsApi = {
  list: (params) => api.get("/api/brands", { params }),
  create: (payload) => api.post("/api/brands", payload),
  update: (id, payload) => api.put(`/api/brands/${id}`, payload),
  remove: (id) => api.delete(`/api/brands/${id}`),
};

export const categoriesApi = {
  list: (params) => api.get("/api/categories", { params }),
  create: (payload) => api.post("/api/categories", payload),
  update: (id, payload) => api.put(`/api/categories/${id}`, payload),
  remove: (id) => api.delete(`/api/categories/${id}`),
};

export const productsApi = {
  list: (params) => api.get("/api/products", { params }),
  detail: (id) => api.get(`/api/products/${id}`),
  create: (payload) => api.post("/api/products", payload),
  update: (id, payload) => api.put(`/api/products/${id}`, payload),
  remove: (id) => api.delete(`/api/products/${id}`),
};

export const customersApi = {
  list: (params) => api.get("/api/customers", { params }),
  detail: (id) => api.get(`/api/customers/${id}`),
  create: (payload) => api.post("/api/customers", payload),
  update: (id, payload) => api.put(`/api/customers/${id}`, payload),
  remove: (id) => api.delete(`/api/customers/${id}`),
};

export const ordersApi = {
  list: (params) => api.get("/api/orders", { params }),
  detail: (id) => api.get(`/api/orders/${id}`),
  create: (payload) => api.post("/api/orders", payload),
  update: (id, payload) => api.put(`/api/orders/${id}`, payload),
  remove: (id) => api.delete(`/api/orders/${id}`),
  items: (id) => api.get(`/api/orders/${id}/items`),
  addItem: (id, payload) => api.post(`/api/orders/${id}/items`, payload),
  updateItem: (orderId, itemId, payload) => api.put(`/api/orders/${orderId}/items/${itemId}`, payload),
  removeItem: (orderId, itemId) => api.delete(`/api/orders/${orderId}/items/${itemId}`),
};

export const staffsApi = {
  list: (params) => api.get("/api/staffs", { params }),
  detail: (id) => api.get(`/api/staffs/${id}`),
  create: (payload) => api.post("/api/staffs", payload),
  update: (id, payload) => api.put(`/api/staffs/${id}`, payload),
  remove: (id) => api.delete(`/api/staffs/${id}`),
};

export const statisticsApi = {
  staffCount: () => api.get("/api/statistics/staffs/count"),
  staffSales: () => api.get("/api/statistics/staffs/sales"),
  staffSalesById: (staffId) => api.get(`/api/statistics/staffs/${staffId}/sales`),
  staffSalesByMonth: (staffId, year) => api.get(`/api/statistics/staffs/${staffId}/sales/by-month`, { params: { year } }),
  staffSalesByDay: (staffId, start_date, end_date) => api.get(`/api/statistics/staffs/${staffId}/sales/by-day`, { params: { start_date, end_date } }),
  storeOverview: () => api.get("/api/statistics/store/overview"),
  storeByDay: (start_date, end_date) => api.get("/api/statistics/store/sales/by-day", { params: { start_date, end_date } }),
  storeByMonth: (year) => api.get("/api/statistics/store/sales/by-month", { params: { year } }),
  storeByQuarter: (year) => api.get("/api/statistics/store/sales/by-quarter", { params: { year } }),
  storeByYear: () => api.get("/api/statistics/store/sales/by-year"),
  topProducts: (limit = 10) => api.get("/api/statistics/products/top-selling", { params: { limit } }),
  topBuyers: (limit = 10) => api.get("/api/statistics/customers/top-buyers", { params: { limit } }),
  highestOrders: (limit = 10) => api.get("/api/statistics/customers/highest-orders", { params: { limit } }),
};
