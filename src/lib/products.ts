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

export const formatPrice = (value: number) => `৳ ${value.toLocaleString("en-US")}`;
