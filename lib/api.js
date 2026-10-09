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
      // Admin data is edited live in the database, so a cached response would
      // show the previous record instead of the current one.
      cache: "no-store",
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
  if (params.createdAfter) query.set("createdAfter", params.createdAfter);

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
  if (params.category) query.set("category", params.category);
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

export const getAdminProductsByIds = (ids, token) => {
  const uniqueIds = [...new Set((ids || []).map((id) => String(id).trim()).filter(Boolean))];
  if (!uniqueIds.length) return Promise.resolve({ products: [] });
  return request(`/api/admin/products/by-ids?ids=${encodeURIComponent(uniqueIds.join(","))}`, {
    token,
  });
};

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
export const deleteAdminCustomer = (id, token) =>
  request(`/api/admin/customers/${encodeURIComponent(id)}`, {
    method: "DELETE",
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

export const updateAdminOrderDetails = (id, payload, token) =>
  request(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const requestPasswordReset = (email) => request("/api/auth/forgot-password", { method: "POST", body: { email } });
export const resetPassword = (payload) => request("/api/auth/reset-password", { method: "POST", body: payload });
export const verifyEmail = (token, email) => request("/api/auth/verify-email", { method: "POST", body: { token, email } });
export const resendVerificationEmail = (email) => request("/api/auth/resend-verification", { method: "POST", body: { email } });
export const subscribeNewsletter = (payload) => request("/api/newsletter", { method: "POST", body: payload });

export const getAdminSettings = (token) => request("/api/admin/settings", { token });
export const updateAdminSettings = (settings, token) => request("/api/admin/settings", { method: "PUT", body: { settings }, token });

export const getAdminHomepage = (token) => request("/api/admin/homepage", { token });
export const updateAdminHomepage = (homepage, token) => request("/api/admin/homepage", { method: "PUT", body: { homepage }, token });

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

/**
 * Voucher preview. `payload` is `{ code, products, email }` where `products`
 * uses the same shape as `validateCheckoutPrices`. The response carries
 * `discountAmount`, and a rejected code arrives as an `Error` whose `.code` is
 * one of INVALID_CODE, INACTIVE, NOT_STARTED, EXPIRED, USAGE_LIMIT_REACHED,
 * CUSTOMER_LIMIT_REACHED, MIN_ORDER_NOT_MET, PRODUCT_NOT_ELIGIBLE,
 * CATEGORY_NOT_ELIGIBLE (with `error.shortfall` for the minimum order case).
 */
export const validateVoucher = (payload, token) =>
  request("/api/vouchers/validate", {
    method: "POST",
    body: payload,
    token,
  });

/**
 * Customer-facing offer list behind checkout's "Apply Voucher" panel.
 * `products` uses the same shape as `validateVoucher` and only filters the
 * result - selecting one of these codes still goes through `validateVoucher`
 * (and the server revalidates again before Stripe is charged).
 */
export const getAvailableVouchers = ({ products = [], email = "" } = {}, token) => {
  const params = new URLSearchParams();
  if (products.length) params.set("items", JSON.stringify(products));
  if (email) params.set("email", email);
  const query = params.toString();
  return request(`/api/vouchers/available${query ? `?${query}` : ""}`, { token });
};

/**
 * Abandoned checkout capture. `POST /api/capture/intent` returns the record id
 * and the server generated visit key; every later step for that visit must send
 * both back with the browser key so the backend can prove ownership.
 */
export const createCaptureIntent = (payload, token) =>
  request("/api/capture/intent", {
    method: "POST",
    body: payload,
    token,
  });

export const pushCaptureStep = (id, payload, token) =>
  request(`/api/capture/intent/${encodeURIComponent(id)}/step`, {
    method: "POST",
    body: payload,
    token,
  });

export const getAdminCaptureRecords = (params = {}, token) => {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.visitorType) query.set("visitorType", params.visitorType);
  if (params.converted) query.set("converted", params.converted);
  if (params.exitPoint) query.set("exitPoint", params.exitPoint);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const qs = query.toString();

  return request(`/api/admin/capture${qs ? `?${qs}` : ""}`, { token });
};

export const getAdminCaptureRecord = (id, token) =>
  request(`/api/admin/capture/${encodeURIComponent(id)}`, { token });

export const deleteAdminCaptureRecord = (id, token) =>
  request(`/api/admin/capture/${encodeURIComponent(id)}`, { method: "DELETE", token });

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

export const bulkUpdateSubCategoryStatus = (categoryName, subCategory, isActive, token) => {
  return request(`/api/admin/products/categories/${encodeURIComponent(categoryName)}/products/subcategory`, {
    method: "PATCH",
    body: { subCategory, isActive },
    token,
  });
};

export const getIngramCategories = (token, params = {}) => {
  const query = new URLSearchParams();
  if (params.onlySaved) query.set("onlySaved", "true");
  if (params.onlyNew) query.set("onlyNew", "true");
  if (params.onlyMissing) query.set("onlyMissing", "true");
  if (params.fast) query.set("fast", "true");
  if (params.onlyWithNewProducts) query.set("onlyWithNewProducts", "true");
  if (params.refresh) query.set("refresh", "true");
  const qs = query.toString();
  return request(`/api/admin/products/categories/ingram${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token,
  });
};

export const startCategoryDiscovery = (token) =>
  request("/api/admin/products/categories/ingram/discover", {
    method: "POST",
    body: {},
    token,
  });

export const getCategoryDiscoveryStatus = (token) =>
  request("/api/admin/products/categories/ingram/discover/status", {
    method: "GET",
    token,
  });

export const previewProductSync = (token) =>
  request("/api/admin/products/sync/preview", {
    token,
  });

export const syncSelectedProducts = (ingramPartNumbers, token) =>
  request("/api/admin/products/sync/selected", {
    method: "POST",
    body: { ingramPartNumbers },
    token,
  });

export const searchIngramCategories = (keyword, token) =>
  request(`/api/admin/products/categories/ingram/search?keyword=${encodeURIComponent(keyword)}`, {
    method: "GET",
    token,
  });

export const getIngramCategoryProducts = (categoryId, params = {}, token) => {
  const query = new URLSearchParams();
  query.set("categoryId", categoryId);
  if (params.categoryName) query.set("categoryName", params.categoryName);
  if (params.pageNumber) query.set("pageNumber", params.pageNumber);
  else if (params.page) query.set("page", params.page);
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

/**
 * Uploads a product image to Cloudinary (single `zoelit/products` folder) and
 * returns the stored public URL that the product record should save.
 */
export async function uploadProductImage(file, token) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");

  const form = new FormData();
  form.append("file", file);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}/api/admin/uploads/image`, {
      method: "POST",
      headers,
      credentials: "include",
      body: form,
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
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent("zoelit-auth-expired", { detail: { path: "/api/admin/uploads/image" } }));
    }
    const error = new Error(data.message || "Image upload failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

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

export const updateAdminCategory = (category, payload, token) =>
  request(`/api/admin/products/categories/${encodeURIComponent(category)}`, {
    method: "PATCH",
    body: payload,
    token,
  });

export const getSyncStatus = (token) =>
  request("/api/admin/products/sync/status", {
    token,
  });

export const getCommissionRules = (token) => request("/api/admin/commissions", { token });
export const createCommissionRule = (payload, token) => request("/api/admin/commissions", { method: "POST", body: payload, token });
export const updateCommissionRule = (id, payload, token) => request(`/api/admin/commissions/${encodeURIComponent(id)}`, { method: "PATCH", body: payload, token });
export const deleteCommissionRule = (id, token) => request(`/api/admin/commissions/${encodeURIComponent(id)}`, { method: "DELETE", token });

export const getAdminVouchers = (token) => request("/api/admin/vouchers", { token });
export const createAdminVoucher = (payload, token) => request("/api/admin/vouchers", { method: "POST", body: payload, token });
export const updateAdminVoucher = (id, payload, token) => request(`/api/admin/vouchers/${encodeURIComponent(id)}`, { method: "PATCH", body: payload, token });
export const updateAdminVoucherStatus = (id, isActive, token) => request(`/api/admin/vouchers/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { isActive }, token });
export const deleteAdminVoucher = (id, token) => request(`/api/admin/vouchers/${encodeURIComponent(id)}`, { method: "DELETE", token });
