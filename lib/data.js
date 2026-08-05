export const customer = {
  name: "Avery Stone",
  email: "avery@example.com",
  phone: "+1 555 0142",
};

export const products = [
  {
    id: "luna-sneaker",
    name: "Luna Knit Sneaker",
    category: "Footwear",
    price: 128,
    rating: 4.8,
    stock: 18,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "A featherweight everyday sneaker with breathable knit and cloud-soft cushioning.",
    highlights: ["Breathable recycled knit upper", "Responsive foam midsole", "Removable cushioned insole", "Flexible rubber outsole"],
    details: { Material: "Recycled knit, rubber, foam", Fit: "True to size", Care: "Spot clean with mild soap", Warranty: "1 year" },
    reviews: [
      { name: "Mia Chen", rating: 5, title: "Comfortable all day", comment: "Lightweight, supportive, and easy to dress up or down for workdays." },
      { name: "Jon Rivera", rating: 5, title: "Great daily sneaker", comment: "The knit feels breathable and the sole has enough cushion for long walks." },
    ],
  },
  {
    id: "atlas-backpack",
    name: "Atlas Commuter Backpack",
    category: "Bags",
    price: 164,
    rating: 4.9,
    stock: 12,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Weather-resistant organization for work, travel, and clean modern carry.",
    highlights: ["16-inch padded laptop sleeve", "Water-resistant shell", "Quick-access front pocket", "Luggage pass-through strap"],
    details: { Capacity: "24L", Material: "Recycled nylon", Dimensions: "18 x 12 x 6 in", Warranty: "2 years" },
    reviews: [
      { name: "Priya Shah", rating: 5, title: "Smart organization", comment: "Everything has a pocket without making the bag bulky." },
      { name: "Eli Brooks", rating: 5, title: "Perfect commute bag", comment: "Stays comfortable on transit and handled light rain without issue." },
    ],
  },
  {
    id: "nova-watch",
    name: "Nova Minimal Watch",
    category: "Accessories",
    price: 215,
    rating: 4.7,
    stock: 9,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    description: "Sapphire glass, brushed steel, and a restrained profile for any wardrobe.",
    highlights: ["Scratch-resistant sapphire crystal", "Japanese quartz movement", "Brushed stainless steel case", "Interchangeable leather strap"],
    details: { Case: "40mm stainless steel", Strap: "Genuine leather", Resistance: "5 ATM water resistant", Warranty: "2 years" },
    reviews: [
      { name: "Nora Lee", rating: 5, title: "Clean and premium", comment: "The case feels solid and the dial is exactly as minimal as pictured." },
      { name: "Sam Patel", rating: 4, title: "Excellent value", comment: "Looks more expensive than it is. Strap softened after a few wears." },
    ],
  },
  {
    id: "aero-jacket",
    name: "Aero Shell Jacket",
    category: "Apparel",
    price: 189,
    rating: 4.6,
    stock: 15,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80",
    description: "A water-repellent technical layer with tailored lines and packable warmth.",
    highlights: ["Durable water-repellent finish", "Packable hood", "Two-way front zipper", "Adjustable hem and cuffs"],
    details: { Shell: "Recycled polyester", Lining: "Lightweight mesh", Fit: "Regular fit", Care: "Machine wash cold" },
    reviews: [
      { name: "Grace Miller", rating: 5, title: "Great travel layer", comment: "Packs small but still feels structured enough for city wear." },
      { name: "Owen Clark", rating: 4, title: "Reliable in drizzle", comment: "Kept me dry during short walks and the fit is sharp." },
    ],
  },
  {
    id: "terra-bottle",
    name: "Terra Steel Bottle",
    category: "Home",
    price: 42,
    rating: 4.8,
    stock: 35,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    description: "Vacuum insulated stainless steel bottle that keeps drinks cold for 24 hours.",
    highlights: ["Double-wall vacuum insulation", "Leakproof screw cap", "BPA-free construction", "Fits most cup holders"],
    details: { Capacity: "24 oz", Material: "18/8 stainless steel", Insulation: "24 hours cold, 12 hours hot", Care: "Hand wash recommended" },
    reviews: [
      { name: "Lena Ortiz", rating: 5, title: "Stays cold forever", comment: "Ice was still in the bottle the next morning." },
      { name: "Mark Lewis", rating: 5, title: "No leaks", comment: "Tossed it in my backpack daily and it has never leaked." },
    ],
  },
  {
    id: "orbit-headphones",
    name: "Orbit ANC Headphones",
    category: "Tech",
    price: 249,
    rating: 4.9,
    stock: 7,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description: "Immersive noise cancellation, balanced audio, and all-day battery life.",
    highlights: ["Adaptive active noise cancellation", "Up to 38 hours battery life", "Multipoint Bluetooth pairing", "Soft memory-foam ear cushions"],
    details: { Battery: "38 hours", Charging: "USB-C fast charge", Connectivity: "Bluetooth 5.3", Warranty: "1 year" },
    reviews: [
      { name: "Amara King", rating: 5, title: "Quiet and comfortable", comment: "The ANC cuts office noise well and they stay comfortable for hours." },
      { name: "Theo Martin", rating: 5, title: "Battery is excellent", comment: "I only charge them once or twice a week with daily use." },
    ],
  },
  {
    id: "linen-shirt",
    name: "Relaxed Linen Shirt",
    category: "Apparel",
    price: 86,
    rating: 4.5,
    stock: 22,
    image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=80",
    description: "Washed linen with a soft drape and effortless resort-ready polish.",
    highlights: ["Pre-washed breathable linen", "Relaxed camp collar", "Natural shell buttons", "Straight hem for easy layering"],
    details: { Material: "100% linen", Fit: "Relaxed fit", Origin: "Made in Portugal", Care: "Machine wash cold" },
    reviews: [
      { name: "Iris Turner", rating: 5, title: "Beautiful fabric", comment: "Soft from the first wear and the drape is very flattering." },
      { name: "Caleb Moore", rating: 4, title: "Easy summer staple", comment: "Breathes well and looks polished without trying too hard." },
    ],
  },
  {
    id: "ceramic-mug",
    name: "Studio Ceramic Mug",
    category: "Home",
    price: 28,
    rating: 4.7,
    stock: 40,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    description: "Hand-finished ceramic mug with a satisfying weight and satin glaze.",
    highlights: ["Hand-finished glaze", "Comfort-grip handle", "Dishwasher safe", "Microwave safe"],
    details: { Capacity: "14 oz", Material: "Stoneware ceramic", Finish: "Satin reactive glaze", Care: "Dishwasher safe" },
    reviews: [
      { name: "Hannah Reed", rating: 5, title: "Feels handmade", comment: "The weight, shape, and glaze make morning coffee feel better." },
      { name: "Leo Adams", rating: 4, title: "Solid mug", comment: "Comfortable handle and a nice size for tea or coffee." },
    ],
  },
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
