const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export { API_URL };

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Unable to reach the server. Make sure the backend is running.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const authRegister = (payload) => request("/api/auth/register", { method: "POST", body: payload });
export const authLogin = (payload) => request("/api/auth/login", { method: "POST", body: payload });
export const authLogout = (token) => request("/api/auth/logout", { method: "POST", token });

export const adminLogin = (payload) => request("/api/admin/auth/login", { method: "POST", body: payload });
export const adminLogout = (token) => request("/api/admin/auth/logout", { method: "POST", token });

export const getProfile = (token) => request("/api/profile", { token });
export const updateProfile = (payload, token) => request("/api/profile", { method: "PATCH", body: payload, token });
export const updatePassword = (payload, token) => request("/api/profile/password", { method: "PATCH", body: payload, token });

export const getDashboardSummary = (token) => request("/api/dashboard/summary", { token });

export const getAddresses = (token) => request("/api/addresses", { token });
export const createAddress = (payload, token) => request("/api/addresses", { method: "POST", body: payload, token });
export const updateAddress = (id, payload, token) => request(`/api/addresses/${id}`, { method: "PATCH", body: payload, token });
export const deleteAddress = (id, token) => request(`/api/addresses/${id}`, { method: "DELETE", token });
export const setDefaultAddress = (id, token) => request(`/api/addresses/${id}/default`, { method: "PATCH", token });

export const getOrders = (token) => request("/api/orders", { token });
export const getOrder = (id, token) => request(`/api/orders/${id}`, { token });

export const getPublicProducts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();
  return request(`/api/products${qs ? `?${qs}` : ""}`);
};

export const getPublicProduct = (id) => request(`/api/products/${encodeURIComponent(id)}`);

export const getProductCategories = () => request("/api/products/categories");

export const getAdminProducts = (params = {}, token) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();
  return request(`/api/admin/products${qs ? `?${qs}` : ""}`, { token });
};

export const getAdminCustomers = (params = {}, token) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();
  return request(`/api/admin/customers${qs ? `?${qs}` : ""}`, { token });
};

export const validateCheckoutPrices = (products, token) =>
  request("/api/checkout/validate", { method: "POST", body: { products }, token });

export const startProductSync = (payload = {}, token) =>
  request("/api/admin/products/sync", { method: "POST", body: payload, token });

export const startPriceSync = (token) =>
  request("/api/admin/products/sync/price", { method: "POST", body: {}, token });
