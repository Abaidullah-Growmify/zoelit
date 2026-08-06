import { addresses, orders, products } from "@/lib/data";

export const adminUser = {
  name: "Jordan Blake",
  email: "admin@zoelit.com",
  role: "Store Admin",
  phone: "+1 555 0198",
};

export const customers = [
  { id: "cus-avery", name: "Avery Stone", email: "avery@example.com", phone: "+1 555 0142", status: "Active", joined: "2026-01-12", orders: 5, totalSpent: 1187, addresses },
  { id: "cus-mia", name: "Mia Chen", email: "mia@example.com", phone: "+1 555 0181", status: "Active", joined: "2026-02-03", orders: 3, totalSpent: 486, addresses: [addresses[0]] },
  { id: "cus-priya", name: "Priya Shah", email: "priya@example.com", phone: "+1 555 0166", status: "Active", joined: "2026-03-18", orders: 2, totalSpent: 328, addresses: [addresses[1]] },
  { id: "cus-sam", name: "Sam Patel", email: "sam@example.com", phone: "+1 555 0125", status: "Blocked", joined: "2026-04-02", orders: 1, totalSpent: 215, addresses: [addresses[0]] },
];

export const categories = Array.from(new Set(products.map((product) => product.category))).map((name) => ({
  id: name.toLowerCase().replaceAll(" ", "-"),
  name,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  description: `${name} products curated for the ZoeLit storefront.`,
  productCount: products.filter((product) => product.category === name).length,
  status: "Active",
}));

export const adminProducts = products.map((product, index) => ({
  ...product,
  sku: `ZL-${String(index + 101).padStart(4, "0")}`,
  status: product.stock < 10 ? "Low Stock" : "Active",
  compareAtPrice: Math.round(product.price * 1.18),
  costPrice: Math.round(product.price * 0.58),
  updatedAt: `2026-07-${String(20 - index).padStart(2, "0")}`,
}));

export const adminOrders = orders.map((order, index) => ({
  ...order,
  customer: customers[index % customers.length],
  subtotal: Math.max(order.total - 18, 0),
  tax: 8,
  shippingFee: 10,
  discount: 0,
  paymentMethod: index % 2 === 0 ? "Visa ending 4242" : "PayPal",
  notes: index === 0 ? "Customer requested gift-ready packaging." : "No internal notes yet.",
  timeline: [
    { label: "Order placed", date: order.date },
    { label: order.payment === "Paid" ? "Payment captured" : "Payment pending", date: order.date },
    { label: order.status, date: order.date },
  ],
}));

export const inventory = adminProducts.map((product) => ({
  productId: product.id,
  productName: product.name,
  image: product.image,
  sku: product.sku,
  category: product.category,
  currentStock: product.stock,
  threshold: 10,
  status: product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? "Low Stock" : "In Stock",
  lastUpdated: product.updatedAt,
}));

export const salesOverview = [
  { date: "2026-07-22", revenue: 820 },
  { date: "2026-07-23", revenue: 940 },
  { date: "2026-07-24", revenue: 875 },
  { date: "2026-07-25", revenue: 1180 },
  { date: "2026-07-26", revenue: 1095 },
  { date: "2026-07-27", revenue: 1340 },
  { date: "2026-07-28", revenue: 1515 },
];

export const adminStats = {
  totalRevenue: adminOrders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.total, 0),
  totalOrders: adminOrders.length,
  totalProducts: adminProducts.length,
  totalCustomers: customers.length,
  pendingOrders: adminOrders.filter((order) => ["Pending", "Processing"].includes(order.status)).length,
  lowStockProducts: inventory.filter((item) => item.status === "Low Stock").length,
  averageOrderValue: Math.round(adminOrders.reduce((sum, order) => sum + order.total, 0) / adminOrders.length),
};

export const adminStatTrends = {
  totalRevenue: { direction: "up", value: "12.4%" },
  totalOrders: { direction: "up", value: "8.1%" },
  totalCustomers: { direction: "up", value: "5.6%" },
  lowStockProducts: { direction: "down", value: "3.2%" },
};

export function getAdminProduct(id) {
  return adminProducts.find((product) => product.id === id);
}

export function getAdminOrder(id) {
  return adminOrders.find((order) => order.id === id);
}

export function getCustomer(id) {
  return customers.find((customer) => customer.id === id);
}
