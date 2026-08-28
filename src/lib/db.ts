import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";

let database: Database.Database | undefined;
const bind = (values: unknown[]) => values.map(value => typeof value === "boolean" ? Number(value) : value);
export function db() {
  if (database) return database;
  const databasePath = path.resolve(process.cwd(), process.env.SQLITE_PATH || "data/noor_atelier.db");
  mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  if (!existsSync(schemaPath)) throw new Error("SQLite schema file is missing.");
  database.exec(readFileSync(schemaPath, "utf8"));
  return database;
}

export async function query<T>(sql: string, values: unknown[] = []) { return db().prepare(sql).all(...bind(values)) as T; }
export async function execute(sql: string, values: unknown[] = []) { const result = db().prepare(sql).run(...bind(values)); return { insertId: Number(result.lastInsertRowid), affectedRows: result.changes }; }
type TransactionConnection = { query<T>(sql: string, values?: unknown[]): Promise<[T]>; execute(sql: string, values?: unknown[]): Promise<[{ insertId: number; affectedRows: number }]> };
export async function transaction<T>(work: (connection: TransactionConnection) => Promise<T>) {
  const sqlite = db();
  sqlite.exec("BEGIN IMMEDIATE");
  const connection: TransactionConnection = { query: async <R>(sql: string, values: unknown[] = []) => [sqlite.prepare(sql).all(...bind(values)) as R], execute: async (sql: string, values: unknown[] = []) => { const result = sqlite.prepare(sql).run(...bind(values)); return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }]; } };
  try { const result = await work(connection); sqlite.exec("COMMIT"); return result; } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
}
export type ProductRow = { id: number; name: string; slug: string; category: "Women" | "Men"; collection: string; price: number; tone: string; image: string; description: string; sizes: string | string[]; featured: number | boolean; active: number | boolean; stock: number; createdAt: Date | string; updatedAt: Date | string; };
export type UserRow = { id: number; name: string; email: string; passwordHash: string; role: "customer" | "admin" };
export type OrderRow = { id: number; orderNumber: string; subtotal: number; status: string; paymentMethod: string; createdAt: Date | string };
export function productJson(product: ProductRow, admin = false) { const sizes = typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes; const value = { id: String(product.id), slug: product.slug, name: product.name, category: product.category, collection: product.collection, price: Number(product.price), tone: product.tone, image: product.image, description: product.description, sizes, featured: Boolean(product.featured), active: Boolean(product.active), stock: Number(product.stock), isNew: Boolean(product.featured) }; return admin ? { ...value, _id: String(product.id), createdAt: product.createdAt, updatedAt: product.updatedAt } : value; }
export function orderJson(order: OrderRow) { return { _id: String(order.id), orderNumber: order.orderNumber, subtotal: Number(order.subtotal), status: order.status, paymentMethod: order.paymentMethod, createdAt: order.createdAt }; }
