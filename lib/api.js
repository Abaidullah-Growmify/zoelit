const DEFAULT_PROD_API_URL = "https://web-zoelit-backend.vercel.app";

function resolveApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (envUrl) {
    if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(envUrl)) {
      return DEFAULT_PROD_API_URL;
    }

    return envUrl;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }

  return DEFAULT_PROD_API_URL;
}

const API_URL = resolveApiUrl();

export { API_URL };

async function request(path, { method = "GET", body, token } = {}) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Make sure the backend is running."
    );
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    if (response.status === 401 && typeof window !== "undefined" && token) {
      window.dispatchEvent(new CustomEvent("zoelit-auth-expired", { detail: { path } }));
    }
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.code = data.code || "";
    throw error;
  }

  return data;
}

export const authRegister = (payload) =>
  request("/api/auth/register", {
    method: "POST",
    body: payload,
  });

export const authLogin = (payload) =>
  request("/api/auth/login", {
    method: "POST",
    body: payload,
  });

export const authLogout = (token) =>
  request("/api/auth/logout", {
    method: "POST",
    token,
  });

export const adminLogin = (payload) =>
  request("/api/admin/auth/login", {
    method: "POST",
    body: payload,
  });

export const adminLogout = (token) =>
  request("/api/admin/auth/logout", {
    method: "POST",
    token,
  });

export const getProfile = (token) =>
  request("/api/profile", {
    token,
  });

export const updateProfile = (payload, token) =>
  request("/api/profile", {
    method: "PATCH",
    body: payload,
    token,
  });

export const updatePassword = (payload, token) =>
  request("/api/profile/password", {
    method: "PATCH",
    body: payload,
    token,
  });

export const getWishlist = (token) =>
  request("/api/profile/wishlist", {
    token,
  });

export const toggleWishlistItem = (payload, token) =>
  request("/api/profile/wishlist", {
    method: "PATCH",
    body: payload,
    token,
  });

export const getDashboardSummary = (token) =>
  request("/api/dashboard/summary", {
    token,
  });

export const getAddresses = (token) =>
  request("/api/addresses", {
    token,
  });

export const createAddress = (payload, token) =>
  request("/api/addresses", {
    method: "POST",
    body: payload,
    token,
  });

export const updateAddress = (id, payload, token) =>
  request(`/api/addresses/${id}`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const deleteAddress = (id, token) =>
  request(`/api/addresses/${id}`, {
    method: "DELETE",
    token,
  });

export const setDefaultAddress = (id, token) =>
  request(`/api/addresses/${id}/default`, {
    method: "PATCH",
    token,
  });

export const getOrders = (token) =>
  request("/api/orders", {
    token,
  });

export const getOrder = (id, token) =>
  request(`/api/orders/${id}`, {
    token,
  });

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

export const getPublicProduct = (id) =>
  request(`/api/products/${encodeURIComponent(id)}`);

export const getProductCategories = () =>
  request("/api/products/categories");

export const getAdminProducts = (params = {}, token) => {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.source) query.set("source", params.source);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();

  return request(`/api/admin/products${qs ? `?${qs}` : ""}`, {
    token,
  });
};

export const getAdminProduct = (id, token) =>
  request(`/api/admin/products/${encodeURIComponent(id)}`, {
    token,
  });

export const updateAdminProduct = (id, payload, token) =>
  request(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const getAdminCustomers = (params = {}, token) => {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();

  return request(`/api/admin/customers${qs ? `?${qs}` : ""}`, {
    token,
  });
};

export const getAdminCustomer = (id, token) =>
  request(`/api/admin/customers/${encodeURIComponent(id)}`, {
    token,
  });

export const createAdminCustomer = (payload, token) =>
  request("/api/admin/customers", {
    method: "POST",
    body: payload,
    token,
  });

export const updateAdminCustomerStatus = (id, payload, token) =>
  request(`/api/admin/customers/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: payload,
    token,
  });
export const updateAdminCustomer = (id, payload, token) =>
  request(`/api/admin/customers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const getAdminOrders = (params = {}, token) => {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();

  return request(`/api/admin/orders${qs ? `?${qs}` : ""}`, {
    token,
  });
};

export const getAdminOrder = (id, token) =>
  request(`/api/admin/orders/${encodeURIComponent(id)}`, {
    token,
  });

export const updateAdminOrderStatus = (id, payload, token) =>
  request(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const requestPasswordReset = (email) => request("/api/auth/forgot-password", { method: "POST", body: { email } });
export const resetPassword = (payload) => request("/api/auth/reset-password", { method: "POST", body: payload });

export const updateAdminManualFulfillment = (id, payload, token) =>
  request(`/api/admin/orders/${encodeURIComponent(id)}/manual-fulfillment`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const cancelAdminOrder = (id, token) =>
  request(`/api/admin/orders/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: {},
    token,
  });

export const getAdminDashboardSummary = (token) =>
  request("/api/admin/dashboard/summary", {
    token,
  });

export const getAdminEmailTemplates = (keyword, token) => request(`/api/admin/email-templates${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`, { token });
export const createAdminEmailTemplate = (payload, token) => request("/api/admin/email-templates", { method: "POST", body: payload, token });
export const updateAdminEmailTemplate = (id, payload, token) => request(`/api/admin/email-templates/${encodeURIComponent(id)}`, { method: "PATCH", body: payload, token });
export const updateAdminEmailTemplateStatus = (id, isActive, token) => request(`/api/admin/email-templates/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { isActive }, token });
export const deleteAdminEmailTemplate = (id, token) => request(`/api/admin/email-templates/${encodeURIComponent(id)}`, { method: "DELETE", token });

export const validateCheckoutPrices = (products, token) =>
  request("/api/checkout/validate", {
    method: "POST",
    body: { products },
    token,
  });

export const createCheckoutSession = (payload, token) =>
  request("/api/checkout/create-checkout-session", {
    method: "POST",
    body: payload,
    token,
  });

export const confirmCheckoutSession = (sessionId, token) =>
  request("/api/checkout/confirm-checkout-session", {
    method: "POST",
    body: { sessionId },
    token,
  });

export const createPaymentIntent = createCheckoutSession;

export const startProductSync = (payload = {}, token) =>
  request("/api/admin/products/sync", {
    method: "POST",
    body: payload,
    token,
  });

export const startPriceSync = (token) =>
  request("/api/admin/products/sync/price", {
    method: "POST",
    body: {},
    token,
  });

export const getAdminCategories = (token) =>
  request("/api/admin/products/categories", {
    method: "GET",
    token,
  });

export const getCategoryProducts = (categoryName, params = {}, token) => {
  const query = new URLSearchParams();

  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();

  return request(`/api/admin/products/categories/${encodeURIComponent(categoryName)}/products${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token,
  });
};

export const getIngramCategories = (token) =>
  request("/api/admin/products/categories/ingram", {
    method: "GET",
    token,
  });

export const searchIngramCategories = (keyword, token) =>
  request(`/api/admin/products/categories/ingram/search?keyword=${encodeURIComponent(keyword)}`, {
    method: "GET",
    token,
  });

export const getIngramCategoryProducts = (categoryName, params = {}, token) => {
  const query = new URLSearchParams();
  query.set("categoryName", categoryName);
  if (params.page) query.set("page", params.page);
  if (params.pageSize) query.set("pageSize", params.pageSize);

  const qs = query.toString();

  return request(`/api/admin/products/categories/ingram/products?${qs}`, {
    method: "GET",
    token,
  });
};

export const createManualCategory = (payload, token) =>
  request("/api/admin/products/categories", {
    method: "POST",
    body: payload,
    token,
  });

export const createManualProduct = (payload, token) =>
  request("/api/admin/products/manual", {
    method: "POST",
    body: payload,
    token,
  });

export const toggleProductActive = (id, token) =>
  request(`/api/admin/products/${encodeURIComponent(id)}/toggle`, {
    method: "PATCH",
    token,
  });

export const toggleCategoryActive = (category, token) =>
  request(`/api/admin/products/categories/${encodeURIComponent(category)}/toggle`, {
    method: "PATCH",
    token,
  });

export const getSyncStatus = (token) =>
  request("/api/admin/products/sync/status", {
    token,
  });
