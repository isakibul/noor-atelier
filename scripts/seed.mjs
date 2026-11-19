import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "fs";
import path from "path";

const databasePath = path.resolve(process.cwd(), process.env.SQLITE_PATH || "data/noor_atelier.db");
mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
db.exec(readFileSync(schemaPath, "utf8"));

const curatedProducts = [
  {
    name: "Gulab Tissue Anarkali",
    slug: "gulab-tissue-anarkali",
    category: "Women",
    collection: "Occasionwear",
    price: 9800,
    tone: "bg-[#f0e0da]",
    image: "/product-anarkali.png",
    description:
      "A sweeping rose-blush tissue anarkali hand-finished with antique zari edging and an organza dupatta. Cut for effortless movement through festive evenings and wedding receptions.",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: 1,
    active: 1,
    stock: 6,
  },
  {
    name: "Meher Silk Jamdani Saree",
    slug: "meher-silk-jamdani-saree",
    category: "Women",
    collection: "Heritage Edit",
    price: 12500,
    tone: "bg-[#ece3da]",
    image: "/product-saree.png",
    description:
      "Handwoven Dhaka muslin-silk blend featuring delicate floral butis along a softly gleaming pallu. Includes an unstitched matching silk blouse piece.",
    sizes: ["Free Size"],
    featured: 1,
    active: 1,
    stock: 4,
  },
  {
    name: "Nizam Ivory Raw Silk Panjabi",
    slug: "nizam-ivory-raw-silk-panjabi",
    category: "Men",
    collection: "Modern classics",
    price: 5600,
    tone: "bg-[#ebe4dc]",
    image: "/product-panjabi.png",
    description:
      "Tailored in breathable ivory raw silk with tone-on-tone resham detailing along the mandarin collar and placket. Refined, structured, and made for Eid mornings and intimate gatherings.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: 1,
    active: 1,
    stock: 9,
  },
  {
    name: "Zoya Rose Chanderi Ensemble",
    slug: "zoya-rose-chanderi-ensemble",
    category: "Women",
    collection: "Occasionwear",
    price: 8400,
    tone: "bg-[#f2ded8]",
    image: "/rose-ensemble.png",
    description:
      "Our signature three-piece chanderi silk ensemble in muted rose with gossamer gota accents, relaxed cigarette trousers, and a scalloped scalloped-border dupatta.",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: 1,
    active: 1,
    stock: 3,
  },
  {
    name: "Chandni Organza Festive Kurti",
    slug: "chandni-organza-festive-kurti",
    category: "Women",
    collection: "Modern classics",
    price: 4600,
    tone: "bg-[#ede4de]",
    image: "/product-anarkali.png",
    description:
      "Featherlight sheer-sleeve organza kurti lined in soft cotton voile with subtle metallic threadwork at the cuffs and hem—effortless for daytime invitations.",
    sizes: ["S", "M", "L", "XL"],
    featured: 0,
    active: 1,
    stock: 11,
  },
  {
    name: "Aarav Sandstone Linen Panjabi",
    slug: "aarav-sandstone-linen-panjabi",
    category: "Men",
    collection: "Heritage Edit",
    price: 4200,
    tone: "bg-[#e7dfd6]",
    image: "/product-panjabi.png",
    description:
      "Relaxed-cut Belgian linen blend panjabi in warm sandstone with hand-stitched pintucks and mother-of-pearl buttons. Cool, crisp, and tailored for Dhaka summers.",
    sizes: ["S", "M", "L", "XL"],
    featured: 0,
    active: 1,
    stock: 2,
  },
];

const insertProduct = db.prepare(
  `INSERT OR IGNORE INTO products (name, slug, category, collection, price, tone, image, description, sizes, featured, active, stock)
   VALUES (@name, @slug, @category, @collection, @price, @tone, @image, @description, @sizes, @featured, @active, @stock)`,
);

let insertedProducts = 0;
for (const product of curatedProducts) {
  const result = insertProduct.run({ ...product, sizes: JSON.stringify(product.sizes) });
  insertedProducts += result.changes;
}

const insertCoupon = db.prepare(
  `INSERT OR IGNORE INTO coupons (code, type, value, min_order, active) VALUES (?, ?, ?, ?, 1)`,
);
insertCoupon.run("NOOR10", "percent", 10, 5000);
insertCoupon.run("WELCOME500", "fixed", 500, 3000);

console.log(`Seed complete: ${insertedProducts} new curated products added (existing records preserved).`);
