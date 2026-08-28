CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('Women', 'Men')), collection TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0), tone TEXT NOT NULL DEFAULT 'bg-[#e8ddd2]', image TEXT NOT NULL,
  description TEXT NOT NULL, sizes TEXT NOT NULL, featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1, stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS products_featured_created_index ON products (featured, created_at);
CREATE INDEX IF NOT EXISTS products_active_index ON products (active);
CREATE TABLE IF NOT EXISTS `orders` (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_number TEXT NOT NULL UNIQUE, user_id INTEGER,
  customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_address TEXT NOT NULL,
  subtotal REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'card')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS orders_user_created_index ON `orders` (user_id, created_at);
CREATE INDEX IF NOT EXISTS orders_status_index ON `orders` (status);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
  name TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL CHECK (quantity > 0), size TEXT NOT NULL, image TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES `orders`(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS order_items_order_index ON order_items (order_id);
