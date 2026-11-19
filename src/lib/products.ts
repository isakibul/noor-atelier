export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Women" | "Men";
  collection: string;
  price: number;
  tone?: string;
  image: string;
  description: string;
  sizes: string[];
  featured: boolean;
  active: boolean;
  stock: number;
  isNew?: boolean;
};

export type OrderItemSummary = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
};

export type OrderSummary = {
  _id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  deliveryFee: number;
  total: number;
  notes: string | null;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cod";
  createdAt: string;
  items?: OrderItemSummary[];
};

export const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"] as const;

export const formatPrice = (value: number) => `৳ ${Math.round(value).toLocaleString("en-US")}`;
