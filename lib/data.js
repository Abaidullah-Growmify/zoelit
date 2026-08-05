export const customer = {
  name: "Avery Stone",
  email: "avery@example.com",
  phone: "+1 555 0142",
};

export const products = [
  { id: "luna-sneaker", name: "Luna Knit Sneaker", category: "Footwear", price: 128, rating: 4.8, stock: 18, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", description: "A featherweight everyday sneaker with breathable knit and cloud-soft cushioning." },
  { id: "atlas-backpack", name: "Atlas Commuter Backpack", category: "Bags", price: 164, rating: 4.9, stock: 12, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", description: "Weather-resistant organization for work, travel, and clean modern carry." },
  { id: "nova-watch", name: "Nova Minimal Watch", category: "Accessories", price: 215, rating: 4.7, stock: 9, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80", description: "Sapphire glass, brushed steel, and a restrained profile for any wardrobe." },
  { id: "aero-jacket", name: "Aero Shell Jacket", category: "Apparel", price: 189, rating: 4.6, stock: 15, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80", description: "A water-repellent technical layer with tailored lines and packable warmth." },
  { id: "terra-bottle", name: "Terra Steel Bottle", category: "Home", price: 42, rating: 4.8, stock: 35, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80", description: "Vacuum insulated stainless steel bottle that keeps drinks cold for 24 hours." },
  { id: "orbit-headphones", name: "Orbit ANC Headphones", category: "Tech", price: 249, rating: 4.9, stock: 7, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", description: "Immersive noise cancellation, balanced audio, and all-day battery life." },
  { id: "linen-shirt", name: "Relaxed Linen Shirt", category: "Apparel", price: 86, rating: 4.5, stock: 22, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=80", description: "Washed linen with a soft drape and effortless resort-ready polish." },
  { id: "ceramic-mug", name: "Studio Ceramic Mug", category: "Home", price: 28, rating: 4.7, stock: 40, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80", description: "Hand-finished ceramic mug with a satisfying weight and satin glaze." },
];

export const orders = [
  { id: "1008", date: "2026-07-28", status: "Delivered", total: 377, payment: "Paid", tracking: "ZX-938201", items: [{ productId: "orbit-headphones", quantity: 1 }, { productId: "terra-bottle", quantity: 2 }] },
  { id: "1007", date: "2026-07-19", status: "Shipped", total: 164, payment: "Paid", tracking: "ZX-938144", items: [{ productId: "atlas-backpack", quantity: 1 }] },
  { id: "1006", date: "2026-07-08", status: "Processing", total: 317, payment: "Paid", tracking: "", items: [{ productId: "aero-jacket", quantity: 1 }, { productId: "luna-sneaker", quantity: 1 }] },
  { id: "1005", date: "2026-06-22", status: "Pending", total: 114, payment: "Pending", tracking: "", items: [{ productId: "linen-shirt", quantity: 1 }, { productId: "ceramic-mug", quantity: 1 }] },
  { id: "1004", date: "2026-06-04", status: "Cancelled", total: 215, payment: "Refunded", tracking: "", items: [{ productId: "nova-watch", quantity: 1 }] },
];

export const addresses = [
  { id: "home", label: "Home", name: "Avery Stone", line1: "430 Market Street", city: "San Francisco", region: "CA", postal: "94103", country: "United States", default: true },
  { id: "office", label: "Office", name: "Avery Stone", line1: "88 Mission Bay Blvd", city: "San Francisco", region: "CA", postal: "94158", country: "United States", default: false },
];

export const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export function getProduct(id) {
  return products.find((product) => product.id === id);
}

export function getOrder(id) {
  return orders.find((order) => order.id === id);
}

export function orderItems(order) {
  return order.items.map((item) => ({ ...item, product: getProduct(item.productId) })).filter((item) => item.product);
}
