import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import { z } from "zod";
import type { OrderItemSummary, OrderSummary, Product } from "@/lib/products";

const globalForDb = globalThis as typeof globalThis & { __noorAtelierDb?: Database.Database };
const bind = (values: unknown[]) => values.map(value => typeof value === "boolean" ? Number(value) : value);
const adminCredentials = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(100),
});

function provisionAdmin(database: Database.Database) {
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (configuredEmail === undefined && configuredPassword === undefined) return;

  const parsed = adminCredentials.safeParse({ email: configuredEmail, password: configuredPassword });
  if (!parsed.success) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must both be configured with valid credentials.");

  const email = parsed.data.email.toLowerCase();
  const passwordHash = bcrypt.hashSync(parsed.data.password, 12);
  const existing = database.prepare("SELECT id FROM users WHERE lower(email) = ? LIMIT 1").get(email) as { id: number } | undefined;
  if (existing) {
    database.prepare("UPDATE users SET email = ?, password_hash = ?, role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(email, passwordHash, existing.id);
  } else {
    database.prepare("INSERT INTO users (name, email, password_hash, role) VALUES ('Administrator', ?, ?, 'admin')").run(email, passwordHash);
  }
}

function ensureSchemaExtensions(database: Database.Database) {
  const columns = new Set(
    (database.prepare("PRAGMA table_info(`orders`)").all() as Array<{ name: string }>).map(col => col.name),
  );
  if (!columns.has("discount")) database.exec("ALTER TABLE `orders` ADD COLUMN discount REAL NOT NULL DEFAULT 0");
  if (!columns.has("coupon_code")) database.exec("ALTER TABLE `orders` ADD COLUMN coupon_code TEXT");
  if (!columns.has("delivery_fee")) database.exec("ALTER TABLE `orders` ADD COLUMN delivery_fee REAL NOT NULL DEFAULT 0");
  if (!columns.has("total")) {
    database.exec("ALTER TABLE `orders` ADD COLUMN total REAL NOT NULL DEFAULT 0");
    database.exec("UPDATE `orders` SET total = subtotal WHERE total = 0 AND subtotal > 0");
  }
  if (!columns.has("notes")) database.exec("ALTER TABLE `orders` ADD COLUMN notes TEXT");
}

function seedDefaultCoupons(database: Database.Database) {
  const count = (database.prepare("SELECT COUNT(*) AS count FROM coupons").get() as { count: number }).count;
  if (count > 0) return;
  const insert = database.prepare("INSERT OR IGNORE INTO coupons (code, type, value, min_order, active) VALUES (?, ?, ?, ?, 1)");
  insert.run("NOOR10", "percent", 10, 5000);
  insert.run("WELCOME500", "fixed", 500, 3000);
}

export function db() {
  if (globalForDb.__noorAtelierDb?.open) return globalForDb.__noorAtelierDb;
  const databasePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.SQLITE_PATH || "data/noor_atelier.db");
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  if (!existsSync(schemaPath)) throw new Error("SQLite schema file is missing.");
  database.exec(readFileSync(schemaPath, "utf8"));
  ensureSchemaExtensions(database);
  seedDefaultCoupons(database);
  provisionAdmin(database);
  globalForDb.__noorAtelierDb = database;
  return database;
}

export async function query<T>(sql: string, values: unknown[] = []) {
  return db().prepare(sql).all(...bind(values)) as T;
}

export async function execute(sql: string, values: unknown[] = []) {
  const result = db().prepare(sql).run(...bind(values));
  return { insertId: Number(result.lastInsertRowid), affectedRows: result.changes };
}

type TransactionConnection = {
  query<T>(sql: string, values?: unknown[]): Promise<[T]>;
  execute(sql: string, values?: unknown[]): Promise<[{ insertId: number; affectedRows: number }]>;
};

export async function transaction<T>(work: (connection: TransactionConnection) => Promise<T>) {
  const sqlite = db();
  sqlite.exec("BEGIN IMMEDIATE");
  const connection: TransactionConnection = {
    query: async <R>(sql: string, values: unknown[] = []) => [sqlite.prepare(sql).all(...bind(values)) as R],
    execute: async (sql: string, values: unknown[] = []) => {
      const result = sqlite.prepare(sql).run(...bind(values));
      return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }];
    },
  };
  try {
    const result = await work(connection);
    sqlite.exec("COMMIT");
    return result;
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}

export type ProductRow = {
  id: number;
  name: string;
  slug: string;
  category: "Women" | "Men";
  collection: string;
  price: number;
  tone: string;
  image: string;
  description: string;
  sizes: string | string[];
  featured: number | boolean;
  active: number | boolean;
  stock: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type UserRow = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
};

export type OrderRow = {
  id: number;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  subtotal: number;
  discount?: number;
  couponCode?: string | null;
  deliveryFee?: number;
  total?: number;
  notes?: string | null;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  createdAt: Date | string;
};

export type OrderItemRow = {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
};

export type BespokeRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  dressType: string;
  occasion: string;
  preferredColor: string;
  notes: string;
  status: "new" | "contacted" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type CouponRow = {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  active: number | boolean;
  expiresAt: string | null;
  createdAt: string;
};

export function productJson(product: ProductRow, admin = false) {
  const sizes = typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes;
  const value: Product = {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    category: product.category,
    collection: product.collection,
    price: Number(product.price),
    tone: product.tone,
    image: product.image,
    description: product.description,
    sizes,
    featured: Boolean(product.featured),
    active: Boolean(product.active),
    stock: Number(product.stock),
    isNew: Boolean(product.featured),
  };
  return admin ? { ...value, _id: String(product.id), createdAt: product.createdAt, updatedAt: product.updatedAt } : value;
}

export function orderJson(order: OrderRow, items?: OrderItemSummary[]): OrderSummary {
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discount ?? 0);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const total = order.total && Number(order.total) > 0 ? Number(order.total) : Math.max(0, subtotal - discount) + deliveryFee;
  return {
    _id: String(order.id),
    orderNumber: order.orderNumber,
    ...(order.customerName !== undefined ? { customerName: order.customerName } : {}),
    ...(order.customerEmail !== undefined ? { customerEmail: order.customerEmail } : {}),
    ...(order.customerPhone !== undefined ? { customerPhone: order.customerPhone } : {}),
    ...(order.customerAddress !== undefined ? { customerAddress: order.customerAddress } : {}),
    subtotal,
    discount,
    couponCode: order.couponCode ?? null,
    deliveryFee,
    total,
    notes: order.notes ?? null,
    status: order.status,
    paymentMethod: "cod",
    createdAt: String(order.createdAt),
    ...(items ? { items } : {}),
  };
}

export async function attachOrderItems(orders: OrderRow[]): Promise<OrderSummary[]> {
  if (!orders.length) return [];
  const ids = orders.map(order => order.id);
  const rows = await query<OrderItemRow[]>(
    `SELECT id, order_id AS orderId, product_id AS productId, name, price, quantity, size, image FROM order_items WHERE order_id IN (${ids.map(() => "?").join(", ")}) ORDER BY id ASC`,
    ids,
  );
  const grouped = new Map<number, OrderItemSummary[]>();
  for (const row of rows) {
    const list = grouped.get(row.orderId) ?? [];
    list.push({
      id: String(row.id),
      productId: String(row.productId),
      name: row.name,
      price: Number(row.price),
      quantity: Number(row.quantity),
      size: row.size,
      image: row.image,
    });
    grouped.set(row.orderId, list);
  }
  return orders.map(order => orderJson(order, grouped.get(order.id) ?? []));
}

const PRODUCT_SELECT = "SELECT id, name, slug, category, collection, price, tone, image, description, sizes, featured, active, stock, created_at AS createdAt, updated_at AS updatedAt FROM products";

export async function getActiveProducts(): Promise<Product[]> {
  const rows = await query<ProductRow[]>(`${PRODUCT_SELECT} WHERE active = 1 ORDER BY featured DESC, created_at DESC`);
  return rows.map(row => productJson(row));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [row] = await query<ProductRow[]>(`${PRODUCT_SELECT} WHERE active = 1 AND slug = ? LIMIT 1`, [slug]);
  return row ? productJson(row) : null;
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const rows = await query<ProductRow[]>(
    `${PRODUCT_SELECT} WHERE active = 1 AND id <> ? ORDER BY (category = ?) DESC, (collection = ?) DESC, featured DESC, created_at DESC LIMIT ?`,
    [Number(product.id), product.category, product.collection, limit],
  );
  return rows.map(row => productJson(row));
}
